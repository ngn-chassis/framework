import fs from 'fs-extra'
import path from 'path'
import postcss from 'postcss'
import cssnano from 'cssnano'
import perfectionist from 'perfectionist'

import analyze from './processors/analyze.js'
import env from 'postcss-preset-env'
import processImports from './processors/processImports.js'
import processNotSelectors from 'postcss-selector-not'
import processFunctions from 'postcss-functions'
import processNesting from 'postcss-nesting'

// require('./processors/at-rules.js')(),
// require('./processors/namespace.js')(),
// require('./processors/box-model.js')(this.components),
// require('./processors/charset.js')(),

import Config from './data/Config.js'

export default class StyleSheet {
  ast

  components = []
  exports = []
  functions = []
  imports = []
  interfaces = []
  mixins = []
  themes = []
  make = []

  constructor (entry, imported = false) {
    this.path = entry
    this.imported = imported
  }

  analyze (cb) {
    postcss([analyze(this)]).process(this.ast, {
      from: this.path,
      map: { inline: false }
    }).then(result => {
      this.ast = result
      cb()
    })
  }

  parse (cb) {
    this.ast = postcss.parse(fs.readFileSync(this.path), {
      from: this.path,
      map: { inline: false }
    })

    cb()
  }

  process (cb) {
    let files = []
    let queue = new NGN.Tasks()

    queue.on('taskstart', task => {
      console.log(`${task.name}...`);
    })

    queue.on('complete', () => {
      console.log('Done.\n');
      cb(null, files)
    })

    queue.add(`Parsing ${this.path}`, next => this.parse(next))

    queue.add(`  Analyzing CSS`, next => this.analyze(next))

    queue.add(`  Generating themed versions`, next => {
      this.make.forEach(theme => {
        postcss([
          analyze(this),
          processImports(this.imports),
          env(Config.env),
          // processNotSelectors,

          // processFunctions({
          //   functions: Object.assign({}, Config.functions)
          // }),

          // require('./processors/at-rules.js')(),
          // processNesting,
          // require('./processors/namespace.js')(),
          // require('./processors/box-model.js')(this.components),
          // require('./processors/charset.js')(),
          Config.minify ? cssnano() : perfectionist({ indentSize: 2 })
          // TODO: If user specifies additional plugins, add them here
        ]).process(this.ast, {
          from: this.path,
          to: path.join(Config.output, path.basename(this.path)),
          map: { inline: false }
        }).then(result => {
          console.log(result);
          files.push({
            path: path.join(Config.output, `${path.basename(this.path, '.css')}${this.make.length > 1 ? `.${theme.name}` : ''}.css`),
            css: result.css,
            map: result.map
          })

          cb(null, files)
        }).catch(cb)
      })

      next()
    })

    queue.run(true)
  }
}
