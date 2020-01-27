const fs = require('fs-extra')
const path = require('path')
const postcss = require('postcss')
const env = require('postcss-preset-env')
const CleanCss = require('clean-css')
const nesting = require('postcss-nesting')
const perfectionist = require('perfectionist')
const removeComments = require('postcss-discard-comments')

const ConsoleUtils = require('./utilities/ConsoleUtils.js')

const Config = require('./Config.js')
const Mixin = require('./Mixin.js')

module.exports = class StyleSheet extends NGN.EventEmitter {
  #mixins = {}

  constructor (filepath) {
    super()

    this.path = filepath
    this.raw = fs.readFileSync(filepath).toString()
    this.ast = postcss.parse(this.raw, { from: filepath })
  }

  process (cb) {
    let sourceMap
    let minified

    // Process Imports
    // Process Themes
    // Process remaining mixins
    this.#processMixins()
    this.#processNesting()

    // Process Functions

    // Namespace Selectors

    // Post Processing

    // Process CSS4

    if (Config.minify) {
      minified = new CleanCss({
        sourceMap: Config.sourceMap
      }).minify(this.ast.toString())
    } else {
      this.#beautify()
    }

    cb(null, {
      css: minified ? minified.styles : this.ast.toString(),
      sourceMap: minified ? NGN.coalesce(minified.sourceMap) : null
    })
  }

  #beautify = () => {
    this.ast = perfectionist.process(removeComments.process(this.ast).root).root

    // Remove empty rulesets
    this.ast.walkRules(rule => {
      if (rule.nodes.length === 0) {
        rule.remove()
        return
      }
    })
  }

  #processImports = () => {
    if (!this.#mixins.hasOwnProperty('import')) {
      return
    }

    this.#mixins.import.forEach((mixin, index) => mixin.resolve())

    delete this.#mixins.import
  }

  #processMixins = () => {
    let registered = this.#registerMixins(this.ast)

    if (!registered) {
      return
    }

    this.#processImports()

    // Recurse to handle imported mixins
    this.#processMixins()
  }

  #processNesting = (ast = this.ast) => {
    ast = nesting.process(ast).root
  }

  #registerMixins = ast => {
    let registered = false

    ast.walkAtRules('chassis', atRule => {
      registered = true
      let mixin = new Mixin(atRule)

      if (this.#mixins.hasOwnProperty(mixin.name)) {
        return this.#mixins[mixin.name].push(mixin)
      }

      this.#mixins[mixin.name] = [mixin]
    })

    return registered
  }
}
