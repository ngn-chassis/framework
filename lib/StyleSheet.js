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
const ViewportUtils = require('./utilities/ViewportUtils.js')

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

  #boxModels = {
    block: [],
    inlineBlock: [],
    inline: []
  }

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

    queue.add('Hoisting @imports', this.#hoistImports)

    queue.add('Setting @charset', this.#setCharset)

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

  #addCustomMediaRules = cb => {
    let { widthRanges } = ViewportUtils
    let nodes = []

    widthRanges.forEach((range, index) => {
      let { min, max } = range.bounds
      let rules = []

      if (min && max) {
        rules.push(CSSUtils.createAtRule({
					name: 'custom-media',
					params: `--${range.name} screen and (min-width: ${min}px) and (max-width: ${max}px)`
				}))
      }

      if (index < widthRanges.length - 1) {
        if (min > 0) {
          rules.unshift(CSSUtils.createAtRule({
  					name: 'custom-media',
  					params: `--${range.name}-and-below screen and (max-width: ${max}px)`
  				}))

  				rules.unshift(CSSUtils.createAtRule({
  					name: 'custom-media',
  					params: `--below-${range.name} screen and (max-width: ${min - 1}px)`
  				}))
  			}

        if (index > 0) {
          rules.push(CSSUtils.createAtRule({
    				name: 'custom-media',
    				params: `--${range.name}-and-above screen and (min-width: ${min}px)`
    			}))

          if (index < widthRanges.length - 2) {
            rules.push(CSSUtils.createAtRule({
      				name: 'custom-media',
      				params: `--above-${range.name} screen and (min-width: ${max + 1}px)`
      			}))
          }
        }
      }

      if (index === widthRanges.length - 1) {
        rules.push(CSSUtils.createAtRule({
          name: 'custom-media',
          params: `--${range.name} screen and (min-width: ${min + 1}px)`
        }))
      }

			nodes.push(...rules)
    })

    this.ast.prepend(...nodes)

    cb()
  }

  #addCustomProperties = cb => {
    let { constraints, gutter } = Config.layout

    this.ast.prepend(`
      :root {
        --layout-width-min: ${constraints.width.min}px;
        --layout-width: ${constraints.width.max - constraints.width.min}px;
      	--layout-width-max: ${constraints.width.max}px;
      	--layout-gutter-x: ${gutter.x};
      	--layout-gutter-x-min: ${LayoutUtils.minGutterWidth};
      	--layout-gutter-x-max: ${LayoutUtils.maxGutterWidth};

      	--scale-ratio: ${Config.typography.scaleRatio};
      	--font-size-min: ${TypographyUtils.baseFontSize.min}px;
        --font-size-max: ${TypographyUtils.baseFontSize.max}px;
      	--line-height-min: ${TypographyUtils.baseLineHeight.min / TypographyUtils.baseFontSize.min};
        --line-height-max: ${TypographyUtils.baseLineHeight.max / TypographyUtils.baseFontSize.max};

      	/* --block-margin-y: $(block-margin-y); */

      	/* --inline-block-margin-x: 1em; */
      	/* --inline-block-margin-y: $(inline-block-margin-y); */
      	/* --inline-block-padding-x: $(inline-block-padding-x); */
      	/* --inline-block-padding-y: $(inline-block-padding-y); */

      	/* --pill-padding-x: $(pill-padding-x); */
      	/* --pill-border-radius: $(pill-border-radius); */

      	/* Copic Greys */
      	/* Cool greys */
      	--grey-c00 : rgb(232,240,243);
      	--grey-c01 : rgb(225,233,236);
      	--grey-c02 : rgb(218,227,232);
      	--grey-c03 : rgb(204,215,221);
      	--grey-c04 : rgb(192,203,209);
      	--grey-c05 : rgb(146,160,169);
      	--grey-c06 : rgb(125,139,150);
      	--grey-c07 : rgb(99,112,121);
      	--grey-c08 : rgb(83,93,103);
      	--grey-c09 : rgb(60,71,77);
      	--grey-c10 : rgb(33,42,49);

      	/* Neutral greys */
      	--grey-n00 : rgb(237,237,237);
      	--grey-n01 : rgb(226,227,229);
      	--grey-n02 : rgb(218,219,221);
      	--grey-n03 : rgb(209,210,212);
      	--grey-n04 : rgb(188,189,193);
      	--grey-n05 : rgb(169,170,174);
      	--grey-n06 : rgb(148,149,153);
      	--grey-n07 : rgb(119,120,124);
      	--grey-n08 : rgb(99,100,102);
      	--grey-n09 : rgb(76,77,79);
      	--grey-n10 : rgb(44,45,48);

      	/* Toner greys */
      	--grey-t00 : rgb(237,237,237);
      	--grey-t01 : rgb(234,234,234);
      	--grey-t02 : rgb(225,225,223);
      	--grey-t03 : rgb(211,212,207);
      	--grey-t04 : rgb(188,187,185);
      	--grey-t05 : rgb(168,167,163);
      	--grey-t06 : rgb(147,147,145);
      	--grey-t07 : rgb(117,118,119);
      	--grey-t08 : rgb(99,99,97);
      	--grey-t09 : rgb(76,75,73);
      	--grey-t10 : rgb(51,47,46);
      }
    `)

    cb()
  }

  #addGlobalModifiers = cb => {
    this.ast.prepend(`
      .hidden,
      [hidden] {
      	display: none !important;
      }

      .invisible {
      	visibility: hidden !important;
      }

      .transparent {
      	opacity: 0 !important;
      }

      .text-normal {
      	font-style: normal !important;
      	font-variant: normal !important;
      	text-transform: none !important;
      }

      .text-bold {
        font-weight: bold !important;
      }

      .text-italic {
      	font-style: italic !important;
      }

      .text-oblique {
      	font-style: oblique !important;
      }

      .text-capitalize {
      	text-transform: capitalize !important;
      }

      .text-small-caps {
      	font-variant: small-caps !important;
      }

      .text-uppercase {
      	text-transform: uppercase !important;
      }

      .text-lowercase {
      	text-transform: lowercase !important;
      }

      .text-underline {
      	text-decoration: underline !important;
      }

      .text-strikethrough {
      	text-decoration: line-through !important;
      }

      .text-nowrap {
      	white-space: nowrap !important;
      }

      .text-truncate {
      	overflow: hidden !important;
      }

      .text-ellipsis {
      	overflow: hidden !important;
      	text-overflow: ellipsis !important;
      }
    `)

    cb()
  }

  #addViewportRules = cb => {
    this.ast.prepend(`@viewport {
      width: device-width;
    }`)

    cb()
  }

  #applyBoxModelReset = cb => {
    let { block, inlineBlock, inline } = this.#boxModels

    if (inline.length > 0) {
      this.ast.prepend(`
        ${inline.join(', ')} {
          color: inherit;
        	margin: 0;
        	opacity: 1;
        	padding: 0;
        	text-decoration: none;
        	text-decoration-line: none;
        	text-decoration-style: solid;
        	text-decoration-color: currentColor;
        	text-shadow: none;
        	text-transform: none;
        	unicode-bidi: normal;
        	vertical-align: baseline;
        	visibility: visible;
        	white-space: normal;
        	word-spacing: normal;
        }
      `)
    }

    if (inlineBlock.length > 0) {
      this.ast.prepend(`
        ${inlineBlock.join(', ')} {
          background: transparent none repeat 0% 0% / auto auto padding-box border-box scroll;
        	border: medium none currentColor;
        	border-radius: 0;
        	border-image: none;
        	color: inherit;
        	margin: 0;
        	opacity: 1;
        	outline: medium none invert;
        	padding: 0;
        	text-align: inherit;
        	text-align-last: auto;
        	text-decoration: none;
        	text-decoration-line: none;
        	text-decoration-style: solid;
        	text-decoration-color: currentColor;
        	text-indent: 0;
        	text-shadow: none;
        	text-transform: none;
        	vertical-align: baseline;
        	visibility: visible;
        	white-space: normal;
        	word-spacing: normal;
        }
      `)
    }

    if (block.length > 0) {
      this.ast.prepend(`
        ${block.join(', ')} {
          background: transparent none repeat 0% 0% / auto auto padding-box border-box scroll;
        	border: medium none currentColor;
        	border-radius: 0;
        	border-image: none;
        	opacity: 1;
        	text-align: inherit;
        	text-align-last: auto;
        	visibility: visible;
        }
      `)
    }

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

  #hoistImports = cb => {
    let imports = []

    this.ast.walkAtRules('import', atRule => {
      imports.push(atRule)
      atRule.remove()
    })

    this.ast.prepend(CSSUtils.createRoot(imports))

    cb()
  }

  #initBuiltIns = cb => {
    let queue = new NGN.Tasks()

    queue.on('complete', cb)

    queue.add('Resetting Box Models', this.#applyBoxModelReset)
    queue.add('Initializing Rendering Engine', this.#initRenderingEngine)
    queue.add('Adding Global Modifiers', this.#addGlobalModifiers)
    queue.add('Add @custom-media rules', this.#addCustomMediaRules)
    queue.add('Prepend Custom Properties', this.#addCustomProperties)
    queue.add('Applying Reset', this.#applyReset)
    queue.add('Prepend @vieport Rules', this.#addViewportRules)

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

      .width.constraint {
        width: 100%;
        min-width: ${width.min}px;
        max-width: ${width.max}px;
        margin-left: auto;
        margin-right: auto;
        padding-left: ${gutter.x};
        padding-right: ${gutter.x};
      }

      .min.width.constraint {
        max-width: initial;
      }

      .max.width.constraint {
        min-width: initial;
      }
    `)

    if (['vw', '%'].includes(parseValue.unit(gutter.x).unit)) {
      root.append(`
        @media screen and (max-width: ${width.min}px) {
          .width.constraint {
            padding-left: ${minGutterWidth};
            padding-right: ${minGutterWidth};
          }

          .max.width.constraint {
            padding-left: initial;
            padding-right: initial
          }
        }

        @media screen and (min-width: ${width.max}px) {
          .width.constraint {
            padding-left: ${maxGutterWidth};
            padding-right: ${maxGutterWidth};
          }

          .min.width.constraint {
            padding-left: initial;
            padding-right: initial
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

    // Prepend p rules
    // Prepend Inner Containers
    // Prepend Outer Containers
    // Prepend Root Headings
    // Prepend body rule
    // Prepend html rule

    // TODO: Any elements with the @chassis apply <boxModel>; mixin will need to
    // to be added to this block. The selector of the element should be added to
    // the

    // {
    //   'inline-block': [],
    //
    //   block: [
    //     {
    //       selector: '.my-element',
    //       margin: {
    //         top: false,
    //         right: true,
    //         bottom: true,
    //         left: false
    //       },
    //
    //       padding: {
    //         top: true,
    //         right: true,
    //         bottom: true,
    //         left: true
    //       }
    //     }
    //   ]
    // }

    // let blockElements = {
    //   withMarginBottom: this.#blockElements.filter(element => element.margin.bottom)
    // }

    if (this.#typographyEngineEnabled) {
      this.ast.prepend(`
        html {
          font-size: ${baseFontSize.min}px;
        }

        ${Constants.layout.outerContainers.join(', ')} {
          margin-bottom: ${baseLineHeight.min * scaleRatio}px;
        }

        ${Constants.layout.innerContainers.join(', ')} {
          margin-bottom: ${baseLineHeight.min}px;
        }

        @media (min-width: ${width.min}px) {
          html {
            font-size: calc(${TypographyUtils.getCalcValue(baseFontSize, width)});
          }

          ${Constants.reset.selectorList.join(', ')},
          input,
          textarea,
          button {
            line-height: calc(${TypographyUtils.getCalcValue(baseLineHeight, width)});
          }

          ${Constants.layout.outerContainers.join(', ')} {
            margin-bottom: calc((${TypographyUtils.getCalcValue(baseLineHeight, width)}) * ${scaleRatio});
          }

          ${Constants.layout.innerContainers.join(', ')} {
            margin-bottom: calc(${TypographyUtils.getCalcValue(baseLineHeight, width)});
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
            margin-bottom: ${baseLineHeight.max * scaleRatio}px;
          }

          ${Constants.layout.innerContainers.join(', ')} {
            margin-bottom: ${baseLineHeight.max}px;
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

  #setCharset = cb => {
    this.ast.prepend(`@charset "${Config.charset}"`)
    cb()
  }
}

// Alt version of Typography Renderer using media queries
// Possibly add this as an optional mode
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
