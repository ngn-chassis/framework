const fs = require('fs-extra')
const path = require('path')
const postcss = require('postcss')
const cssnano = require('cssnano')
const perfectionist = require('perfectionist')

const Config = require('./data/Config.js')
const Component = require('./Component.js')
const Export = require('./Export.js')
const Func = require('./Func.js')
const Import = require('./Import.js')
const Interface = require('./Interface.js')
const Mixin = require('./Mixin.js')
const Theme = require('./Theme.js')

module.exports = class StyleSheet {
  ast

  components = []
  exports = []
  functions = []
  imports = []
  interfaces = []
  mixins = []
  themes = []

  constructor (entry, imported = false) {
    this.path = entry
    this.imported = imported

    this.ast = postcss.parse(fs.readFileSync(entry), {
      from: entry,
      to: Config.output
    })

    this.ast.walkAtRules(atRule => {
      switch (atRule.name) {
        case 'component': return this.components.push(new Component(atRule))
        case 'export': return this.exports.push(new Export(atRule))
        case 'function': return this.functions.push(new Func(atRule))
        case 'import': return this.imports.push(new Import(atRule, StyleSheet))
        case 'interface': return this.interfaces.push(new Interface(atRule))
        case 'mixin': return this.mixins.push(new Mixin(atRule))
        case 'theme': return this.themes.push(new Theme(atRule))
      }
    })
  }

  process (cb) {
    let files = []
    let queue = new NGN.Tasks()

    queue.on('complete', () => cb(null, files))

    this.themes.forEach(theme => {
      queue.add(`Generating ${theme.name} theme`, next => {
        postcss([
          // require('postcss-preset-env')(Config.env),
          // require('./processors/imports.js')(this.imports),
          require('postcss-selector-not'),
          require('postcss-functions')({
            functions: Object.assign({}, Config.functions)
          }),
          require('./processors/at-rules.js')(),
          // require('postcss-nesting')(),
          // require('./processors/namespace.js')(),
          // require('./processors/box-model.js')(this.components),
          // require('./processors/charset.js')(),
          Config.minify ? cssnano() : perfectionist({ indentSize: 2 })
          // TODO: If user specifies additional plugins, add them here
        ]).process(this.ast, {
          from: this.path,
          to: Config.output,
          map: { inline: false }
        }).then(result => {
          files.push({
            path: path.join(NGN.coalesce(Config.output, ''), `${path.basename(this.path, '.css')}${this.themes.length > 1 ? `.${theme.name}` : ''}.css`),
            css: result.css,
            map: result.map
          })

          next()
        }).catch(cb)
      })
    })

    queue.run()
  }
}
