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
const ErrorUtils = require('./utilities/ErrorUtils.js')
const FileUtils = require('./utilities/FileUtils.js')

const Config = require('./Config.js')

const Rule = require('./Rule.js')
const Decl = require('./Decl.js')
const Mixin = require('./Mixin.js')
const Func = require('./Func.js')

module.exports = class StyleSheet extends NGN.EventEmitter {
  #initialized = false
  #typographyEngineEnabled = false

  #rules = []
  #decls = []
  #mixins = []
  #imports = []

  // #functions = {}

  constructor (filepath) {
    super()

    this.path = filepath
    this.raw = fs.readFileSync(filepath).toString()
    this.ast = postcss.parse(this.raw, { from: filepath })
  }

  process (cb) {
    let queue = new NGN.Tasks()
    let minified

    queue.on('taskstart', task => console.log(`${task.name}...`))
    queue.on('taskcomplete', task => console.log(`Done.`))

    queue.on('complete', () => cb(null, {
      css: minified ? minified.styles : this.ast.toString(),
      sourceMap: minified ? NGN.coalesce(minified.sourceMap) : null
    }))

    queue.add(`Analyzing ${this.path}`, next => {
      this.ast.walk((node, index) => {
        switch (node.type) {
          case 'rule': return this.#rules.push(new Rule(node))
          case 'decl': return this.#decls.push(new Decl(node))

          case 'atrule':
            if (node.name !== 'chassis') {
              return
            }

            return this.#mixins.push(new Mixin(node))

          default: throw ErrorUtils.createError({
            line: node.source.start.line,
            message: `Invalid node`
          })
        }
      })

      // this.#mixins.forEach(atRule => atRule.process())
      // this.#rules.forEach(rule => rule.process())
      // this.#decls.forEach(decl => decl.process())

      next()
    })

    queue.add('Registering Imports', next => {
      let imports = []

      this.#mixins = this.#mixins.filter(mixin => {
        if (mixin.name === 'import') {
          imports.push(mixin)
        }

        return mixin.name !== 'import'
      })

      imports.forEach(mixin => {
        let filepath = FileUtils.getImportFilepath(mixin.args[0].value, Config.importBasePath)

        if (!FileUtils.fileExists(filepath, false)){
          return cb(ErrorUtils.createError({
            line: mixin.source.line,
            mixin: 'import',
            message: `"${filepath}" not found`,
            file: this.path
          }))
        }

        this.#imports.push({
          atRule: mixin.atRule,
          styleSheet: new StyleSheet(filepath)
        })
      })

      next()
    })

    queue.add('Processing Mixins', this.#processMixins)

    queue.add('Processing :not() Instances', this.#processNotSelectors)

    queue.add('Processing Functions', this.#processFunctions)

    queue.add('Constructing Output', next => {
      this.#imports.forEach(imp => {
        imp.styleSheet.process((err, output) => {
          if (err) {
            throw err
          }

          imp.atRule.replaceWith(output.css)
        })
      })

      next()
    })

    // queue.add('Processing Nesting', this.#processNesting)

    // this.#namespaceSelectors()

    // queue.add('Initializing Chassis Built-ins', next => {
    //   if (!this.#initialized) {
    //     return next()
    //   }
    //
    //   // Prepend Block Component Reset
    //   // Prepend Inline-block Component Reset
    //   // Prepend Inline Component Reset
    //
    //   // if (this.#typographyEngineEnabled) {
    //   //   // Prepend Typography Ranges
    //   //   this.#initTypographyEngine()
    //   // }
    //
    //   // Prepend p rules
    //   // Prepend Inner Containers
    //   // Prepend Outer Containers
    //   // Prepend Root Headings
    //   // Prepend body rule
    //   // Prepend html rule
    //
    //   // Prepend constraints
    //
    //   // Prepend global modifiers
    //
    //   // Prepend @custom-media rules
    //
    //   // Prepend custom properties (:root)
    //
    //   // Prepend reset
    //
    //   // Prepend @viewport rules
    //
    //   next()
    // })

    // Hoist imports

    // this.#postProcess()

    // queue.add('Processing CSS4 Syntax', this.#processCSS4)

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

  // #initTypographyEngine = () => console.log('Init Typography')

  // #processAtRules = cb => {
  //   let registered = this.#registerMixins()
  //
  //   if (!registered) {
  //     return cb()
  //   }
  //
  //   this.#processMixins('import')
  //   this.#processMixins('theme')
  //   this.#processMixins('all')
  //
  //   // Recurse to handle imported mixins
  //   this.#processAtRules(cb)
  // }

  // #processCSS4 = cb => env.process(this.ast, { from: this.path }, Config.env)
  //   .then(processed => {
  //     this.ast = processed
  //     cb()
  //   }).catch(err => {
  //     throw ErrorUtils.createError({ message: err })
  //   })

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

  // #processMixin = mixin => mixin.resolve()

  // #processMixins = type => {
  //   if (!type) {
  //     return
  //   }
  //
  //   if (type === 'all') {
  //     for (let type in this.#mixins) {
  //       this.#processMixins(type)
  //     }
  //
  //     return
  //   }
  //
  //   if (!this.#mixins.hasOwnProperty(type)) {
  //     return
  //   }
  //
  //   this.#mixins[type].forEach(this.#processMixin)
  //   delete this.#mixins[type]
  // }

  #processNesting = () => this.ast = nesting.process(this.ast).root

  #processNotSelectors = cb => {
    this.ast = processNot.process(this.ast).root
    cb()
  }

  // #registerMixins = () => {
  //   let registered = false
  //
  //   this.ast.walkAtRules('chassis', atRule => {
  //     if (mixin.name === 'init') {
  //       this.#initialized = true
  //       return atRule.remove()
  //     }
  //
  //     registered = true
  //
  //     if (this.#mixins.hasOwnProperty(mixin.name)) {
  //       return this.#mixins[mixin.name].push(mixin)
  //     }
  //
  //     this.#mixins[mixin.name] = [mixin]
  //   })
  //
  //   return registered
  // }
}
