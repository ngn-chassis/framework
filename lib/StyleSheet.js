const fs = require('fs-extra')
const path = require('path')
const postcss = require('postcss')
const env = require('postcss-preset-env')
const CleanCss = require('clean-css')
const nesting = require('postcss-nesting')
const perfectionist = require('perfectionist')
const parseValue = require('postcss-value-parser')
const processNot = require('postcss-selector-not')
const removeComments = require('postcss-discard-comments')

const ConsoleUtils = require('./utilities/ConsoleUtils.js')
const CSSUtils = require('./utilities/CSSUtils.js')
const ErrorUtils = require('./utilities/ErrorUtils.js')
const FileUtils = require('./utilities/FileUtils.js')
const LayoutUtils = require('./utilities/LayoutUtils.js')
const TypographyUtils = require('./utilities/TypographyUtils.js')
const UnitUtils = require('./utilities/UnitUtils.js')

const Constants = require('./data/Constants.js')
const Config = require('./Config.js')

const Mixin = require('./Mixin.js')
const Func = require('./Func.js')

module.exports = class StyleSheet extends NGN.EventEmitter {
  #initialized = false
  #typographyEngineEnabled = !Config.typography.disabled
  #layoutEngineEnabled = !Config.layout.disabled

  #mixins = []
  #imports = []

  constructor (filepath, imported = false) {
    super()

    this.path = filepath
    this.raw = fs.readFileSync(filepath).toString()
    this.isImported = imported
  }

  process (cb) {
    let queue = new NGN.Tasks()
    let minified

    // queue.on('taskstart', task => console.log(`${task.name}...`))
    // queue.on('taskcomplete', task => console.log(`Done.`))

    queue.on('complete', () => {
      cb(null, {
        css: minified ? minified.styles : this.ast.toString(),
        sourceMap: minified ? NGN.coalesce(minified.sourceMap) : null
      })
    })

    queue.add('Processing CSS4 Syntax', this.#processCSS4)
    queue.add('Registering Mixins', this.#registerMixins)
    queue.add('Registering Imports', this.#registerImports)
    queue.add('Processing :not() Instances', this.#processNotSelectors)
    queue.add('Processing Functions', this.#processFunctions)
    queue.add('Processing Mixins', this.#processMixins)
    queue.add('Constructing Output', this.#constructOutput)
    queue.add('Processing Nesting', this.#processNesting)

    queue.add('Initializing Chassis Built-ins', next => {
      if (!this.#initialized) {
        return next()
      }

      this.#initBuiltIns(next)
    })

    // Hoist imports

    // queue.add('Running Post-Processing Routines', this.#postProcess)

    if (!this.isImported) {
      queue.add('Namespacing Selectors', this.#namespaceSelectors)
    }

    if (Config.minify) {
      queue.add('Minifying Output', next => {
        minified = new CleanCss({
          sourceMap: Config.sourceMap
        }).minify(this.ast.toString())

        next()
      })
    } else {
      queue.add('Beautifying Output', this.#beautify)
    }

    queue.run(true)
  }

  // #reset = type => {
  //   let { boxModels } = Config
  //   let selectors = {}
  //
  //   for (let list in boxModels) {
  //     selectors[list] = boxModels[list].map(selectorString => {
  //       selectorString = `.chassis ${selectorString.trim()}`
  //
  //       if (selectorString.includes(',')) {
  //         return selectorString.split(',').map(selector => selector.trim()).join(', .chassis ')
  //       }
  //
  //       return selectorString
  //     }).join(', ')
  //   }
  //
  //   return selectors
  // }

  #initBuiltIns = cb => {
    let queue = new NGN.Tasks()

    queue.on('complete', cb)

    // queue.add('Resetting Box Models', this.#applyBoxModelReset)

    queue.add('Initializing Rendering Engine', this.#initRenderingEngine)

    // Prepend p rules
    // Prepend Inner Containers
    // Prepend Outer Containers
    // Prepend Root Headings
    // Prepend body rule
    // Prepend html rule
    // queue.add('Initializing Layout Engine', this.#initLayoutEngine)

    // Prepend global modifiers

    // Prepend @custom-media rules

    // Prepend custom properties (:root)

    // Prepend reset
    queue.add('Applying Reset', this.#applyReset)

    // Prepend @viewport rules

    queue.run(true)
  }

  #applyBoxModelReset = cb => {
    this.ast.prepend(`

    `)

    cb()
  }

  #applyReset = cb => {
    let { baseFontSize, baseLineHeight } = TypographyUtils

    this.ast.prepend(`
      *, *:before, *:after {
        box-sizing: border-box;
      }

      ${Constants.reset.selectorList.join(', ')} {
        margin: 0;
        padding: 0;
        border: 0;
        font: inherit;
        font-size: 100%;
        line-height: ${baseLineHeight.min / baseFontSize.min};
        vertical-align: baseline;
      }

      ol, ul {
        list-style: none;
      }

      q, blockquote {
        quotes: none;
      }

      q:before, q:after,
      blockquote:before, blockquote:after {
        content: '';
        content: none;
      }

      a img {
        border: none;
      }

      ${Constants.layout.blockElements.join(', ')} {
        display: block;
      }

      input, textarea, button {
        font-size: inherit;
        line-height: ${baseLineHeight.min / baseFontSize.min};
      }
    `)

    cb()
  }

  #beautify = cb => {
    // TODO: Add try/catch statements here
    this.ast = perfectionist.process(removeComments.process(this.ast).root, {
      indentSize: 2
    }).root

    // Remove empty rulesets
    this.ast.walkRules(rule => {
      if (rule.nodes.length === 0) {
        rule.remove()
        return
      }
    })

    cb()
  }

  #constructOutput = cb => {
    let queue = new NGN.Tasks()

    queue.on('complete', cb)

    this.#imports.forEach(imp => {
      queue.add(`Importing ${imp.styleSheet.path}`, next => {
        imp.styleSheet.process((err, output) => {
          if (err) {
            throw err
          }

          imp.atRule.replaceWith(output.css)
          next()
        })
      })
    })

    queue.run(true)
  }

  #initConstraints = cb => {
    let { gutter, width, height, minGutterWidth, maxGutterWidth } = LayoutUtils

    let root = CSSUtils.createRoot([])

    root.append(`
      .height.constraint {
        min-height: ${NGN.coalesce(height.min, 0)}px;
        max-height: ${height.max ? `${height.max}px` : 'initial'};
      }

      .min.height.constraint {
        max-height: initial;
      }

      .max.height.constraint {
        min-height: initial;
      }
    `)

    root.append(`
      .width.constraint {
        width: 100%;
        min-width: ${width.min}px;
        max-width: ${width.max}px;
        margin-left: auto;
        margin-right: auto;
        padding-left: ${gutter.x};
        padding-right: ${gutter.x};
      }
    `)

    if (['vw', '%'].includes(parseValue.unit(gutter.x).unit)) {
      root.append(`
        @media screen and (max-width: ${width.min}px) {
          .width.constraint {
            padding-left: ${minGutterWidth};
            padding-right: ${minGutterWidth};
          }
        }

        @media screen and (min-width: ${width.max}px) {
          .width.constraint {
            padding-left: ${maxGutterWidth};
            padding-right: ${maxGutterWidth};
          }
        }
      `)
    }

    this.ast.prepend(root)

    cb()
  }

  #initRenderingEngine = cb => {
    let { baseFontSize, baseLineHeight, scaleRatio } = TypographyUtils
    let { width } = LayoutUtils

    if (this.#typographyEngineEnabled) {
      this.ast.prepend(`
        html {
          font-size: ${baseFontSize.min}px;
        }

        ${Constants.layout.outerContainers.join(', ')} {
          margin-bottom: ${LayoutUtils.calculateMarginBottom(baseLineHeight.min / baseFontSize.min, 'outer')}em;
        }

        ${Constants.layout.innerContainers.join(', ')} {
          margin-bottom: ${LayoutUtils.calculateMarginBottom(baseLineHeight.min / baseFontSize.min, 'inner')}em;
        }

        @media (min-width: ${width.min}px) {
          html {
            font-size: calc(${baseFontSize.min}px + (${baseFontSize.max} - ${baseFontSize.min}) * ((100vw - ${width.min}px) / (${width.max} - ${width.min})));
          }

          ${Constants.reset.selectorList.join(', ')},
          input,
          textarea,
          button {
            line-height: calc(${baseLineHeight.min}px + (${baseLineHeight.max} - ${baseLineHeight.min}) * ((100vw - ${width.min}px) / (${width.max} - ${width.min})));
          }

          ${Constants.layout.outerContainers.join(', ')} {
            margin-bottom: calc(${LayoutUtils.calculateMarginBottom(baseLineHeight.min, 'outer')}px + (${baseLineHeight.max} - ${baseLineHeight.min}) * ((100vw - ${width.min}px) / (${width.max} - ${width.min})));
          }

          ${Constants.layout.innerContainers.join(', ')} {
            margin-bottom: calc(${LayoutUtils.calculateMarginBottom(baseLineHeight.min, 'inner')}px + (${baseLineHeight.max} - ${baseLineHeight.min}) * ((100vw - ${width.min}px) / (${width.max} - ${width.min})));
          }
        }

        @media (min-width: ${width.max}px){
          html {
            font-size: ${baseFontSize.max}px;
          }

          ${Constants.reset.selectorList.join(', ')},
          input,
          textarea,
          button {
            line-height: ${baseLineHeight.max / baseFontSize.max};
          }

          ${Constants.layout.outerContainers.join(', ')} {
            margin-bottom: ${LayoutUtils.calculateMarginBottom(baseLineHeight.max / baseFontSize.max, 'outer')}em;
          }

          ${Constants.layout.innerContainers.join(', ')} {
            margin-bottom: ${LayoutUtils.calculateMarginBottom(baseLineHeight.max / baseFontSize.max, 'inner')}em;
          }
        }
      `)
    }

    this.#layoutEngineEnabled ? this.#initConstraints(cb) : cb()
  }

  #namespaceSelector = selector => {
    if (selector.includes(',')) {
      return selector.split(',').map(chunk => this.#namespaceSelector(chunk.trim())).join(', ')
    }

    if (selector.includes('html')) {
      return `${selector.trim()}.chassis`
    }

    if (selector.includes(':root')) {
      return selector.trim()
    }

    return `.chassis ${selector.trim()}`
  }

  #namespaceSelectors = cb => {
    this.ast.walkRules(rule => {
      // Cleanup empty rulesets
      if (rule.nodes.length === 0) {
        rule.remove()
        return
      }

      if (rule.parent && rule.parent.type === 'atrule' && rule.parent.name === 'keyframes') {
        return
      }

      rule.selector = this.#namespaceSelector(rule.selector)
    })

    cb()
  }

  #processCSS4 = cb => {
    env.process(this.raw, {
      from: this.path
    }, Config.env).then(processed => {
      this.ast = processed.root
      cb()
    }).catch(err => {
      throw ErrorUtils.createError({ message: err })
    })
  }

  #processFunctions = cb => {
    this.ast.walkDecls(decl => {
      let parsed = parseValue(decl.value)

      if (!parsed.nodes.some(node => node.type === 'function')) {
        return
      }

      let resolved = true

      parsed.walk((node, index) => {
        if (node.type !== 'function') {
          return
        }

        let func = new Func(node, decl.source.start)

        func.resolve((err, value) => {
          if (err) {
            throw err
          }

          node.value = value
          node.type = 'word'
          node.nodes = []
        })
      })


      decl.value = parsed.toString()
    })

    cb()
  }

  #processMixins = cb => {
    this.#mixins.forEach(mixin => {
      if (mixin.name === 'init') {
        this.#initialized = true
        return mixin.atRule.remove()
      }

      mixin.resolve()
    })

    cb()
  }

  #processNesting = () => this.ast = nesting.process(this.ast).root

  #processNotSelectors = cb => {
    this.ast = processNot.process(this.ast).root
    cb()
  }

  #registerImports = cb => {
    let imports = []

    this.#mixins = this.#mixins.filter(mixin => {
      if (mixin.name === 'import') {
        imports.push(mixin)
      }

      return mixin.name !== 'import'
    })

    imports.forEach(mixin => {
      let filepath = FileUtils.getImportFilepath(mixin.args[0].value, this.path)

      if (!FileUtils.fileExists(filepath, false)){
        return cb(ErrorUtils.createError({
          file: this.path,
          line: mixin.source.line,
          mixin: 'import',
          message: `"${filepath}" not found`
        }))
      }

      this.#imports.push({
        atRule: mixin.atRule,
        styleSheet: new StyleSheet(filepath, true)
      })
    })

    cb()
  }

  #registerMixins = cb => {
    this.ast.walk((node, index) => {
      if (node.type === 'atrule') {
        if (node.name !== 'chassis') {
          return
        }

        return this.#mixins.push(new Mixin(node, this.ast))
      }
    })

    cb()
  }
}

// #initTypographyEngine = cb => {
//   let { constraints, scaleRatio } = Config.typography
//   let { baseFontSize } = constraints
//   let { width } = Config.layout.constraints
//
//   let root = CSSUtils.createRoot([])
//
//   root.append(`
//     html {
//       font-size: ${baseFontSize.min}px;
//     }
//   `)
//
//   let increment = ((width.max - width.min) / (baseFontSize.max - baseFontSize.min)) * baseFontSize.increment
//   let fontSize = baseFontSize.min
//
//   let queries = []
//
//   for (let w = width.min + increment; w < width.max; w += increment) {
//     fontSize += baseFontSize.increment
//
//     let lineHeight = TypographyUtils.calculateLineHeight(fontSize, w) / fontSize
//     // calc(((100vw − ${width.min}) / (${width.max} − ${width.min})) * (${lineHeight} − 1) + 1)
//     root.append(`
//       @media screen and (min-width: ${w}px) {
//         html {
//           font-size: ${fontSize}px;
//         }
//
//         ${Constants.reset.selectorList.join(', ')} {
//           line-height: ${lineHeight};
//         }
//
//         ${Constants.layout.outerContainers.join(', ')} {
//           margin-bottom: ${LayoutUtils.calculateMarginBottom(lineHeight, 'outer')}em;
//         }
//
//         ${Constants.layout.innerContainers.join(', ')} {
//           margin-bottom: ${LayoutUtils.calculateMarginBottom(lineHeight, 'inner')}em;
//         }
//       }
//     `)
//
//     // let heading
//     //
//     // for (let level = 1; level <= 6; level++) {
//     //
//     // }
//
//     root.append(`
//       h2 {
//         font-size: ${scaleRatio}em;
//         margin-bottom: ${scaleRatio - 1}em;
//       }
//     `)
//   }
//
//   let lineHeight = TypographyUtils.calculateLineHeight(baseFontSize.max, width.max) / baseFontSize.max
//
//   root.append(`
//     @media screen and (min-width: ${width.max}px) {
//       html {
//         font-size: ${baseFontSize.max}px;
//       }
//
//       ${Constants.reset.selectorList.join(', ')} {
//         line-height: ${lineHeight};
//       }
//
//       ${Constants.layout.outerContainers.join(', ')} {
//         margin-bottom: ${LayoutUtils.calculateMarginBottom(lineHeight, 'outer')}em;
//       }
//
//       ${Constants.layout.innerContainers.join(', ')} {
//         margin-bottom: ${LayoutUtils.calculateMarginBottom(lineHeight, 'inner')}em;
//       }
//     }
//   `)
//
//   this.ast.prepend(root)
//
//   cb()
// }
