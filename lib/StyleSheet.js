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

const Config = require('./Config.js')

const Mixin = require('./Mixin.js')
const Func = require('./Func.js')

module.exports = class StyleSheet extends NGN.EventEmitter {
  #initialized = false
  #typographyEngineEnabled = true

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

    if (!this.isImported) {
      queue.add('Namespacing Selectors', this.#namespaceSelectors)
    }

    queue.add('Initializing Chassis Built-ins', next => {
      if (!this.#initialized) {
        return next()
      }

      this.#initBuiltIns(next)
    })

    // Hoist imports

    // queue.add('Running Post-Processing Routines', this.#postProcess)

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

//     queue.add('Resetting Box Models', next => {
// // FileUtils.parseSpecSheet('./specsheets/block-reset.css')
//       console.log(this.#reset('block'))
//       // this.ast.prepend(this.#reset('block'))
//       // this.ast.prepend(FileUtils.parseSpecSheet('./specsheets/inline-block-reset.css'))
//       // this.ast.prepend(FileUtils.parseSpecSheet('./specsheets/inline-reset.css'))
//
//       next()
//     })

    if (this.#typographyEngineEnabled) {
      queue.add('Initializing Typography Engine', this.#initTypographyEngine)
    }

    // Prepend p rules
    // Prepend Inner Containers
    // Prepend Outer Containers
    // Prepend Root Headings
    // Prepend body rule
    // Prepend html rule

    // Prepend constraints

    // Prepend global modifiers

    // Prepend @custom-media rules

    // Prepend custom properties (:root)

    // Prepend reset

    // Prepend @viewport rules

    queue.run(true)
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

  #generateNamespacedSelector = selector => {
    if (selector.includes('html')) {
      selector = `${selector.trim()}.chassis`
    } else if (selector === ':root') {
      selector = selector.trim()
    } else {
      selector = `.chassis ${selector.trim()}`
    }

    if (selector.includes(',')) {
      selector = selector.split(',').map(chunk => chunk.trim()).join(', .chassis ')
    }

    return selector
  }

  #initTypographyEngine = cb => {
    let { minFontSize, maxFontSize, scaleRatio } = Config.typography
    let { minWidth, maxWidth } = Config.layout

    let avgWidth = (maxWidth - minWidth) / 2
    let avgFontSize = maxFontSize - ((maxFontSize - minFontSize) / 2)

    let vw = avgFontSize / ((1000 - ((scaleRatio * 1000) - 1000)) / avgFontSize)
    let px = avgFontSize - ((avgWidth / 100) * vw)

    let minBreakpoint = ((100 * minFontSize) - (100 * px)) / vw
    let maxBreakpoint = ((100 * maxFontSize) - (100 * px)) / vw

    this.ast.prepend(`
      html {
        font-size: ${minFontSize}px
      }

      @media screen and (min-width: ${minBreakpoint}px) {
        html {
          font-size: calc(${vw}vw + ${px}px);
        }
      }

      @media screen and (min-width: ${maxBreakpoint}px) {
        html {
          font-size: ${maxFontSize}px;
        }
      }
    `)

    cb()
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

      rule.selector = this.#generateNamespacedSelector(rule.selector)
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
