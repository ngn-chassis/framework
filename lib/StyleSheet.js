import fs from 'fs-extra'
import path from 'path'
import postcss from 'postcss'
import cssnano from 'cssnano'
import perfectionist from 'perfectionist'

import analyze from './processors/analyze.js'
import env from 'postcss-preset-env'
import handleErrors from './processors/handleErrors.js'
import processAtRules from './processors/processAtRules.js'
import processComponents from './processors/processComponents.js'
import processFunctions from 'postcss-functions'
import processImports from './processors/processImports.js'
import processInlineComponentExtensions from './processors/processInlineComponentExtensions.js'
import applyNamespace from './processors/applyNamespace.js'
import applyCharset from './processors/applyCharset.js'

// require('./processors/box-model.js')(this.components),

import Config from './data/Config.js'
import ErrorUtils from './utilities/ErrorUtils.js'

export default class StyleSheet {
  ast = null
  parent = null
  isImported = false

  components = []
  exports = []
  extensions = []
  functions = []
  imports = []
  interfaces = []
  make = []
  mixins = []
  themes = []

  constructor (entry, parent) {
    this.path = entry
    this.parent = parent
    this.isImported = !!parent

    this.ast = postcss.parse(fs.readFileSync(this.path), {
      from: this.path,
      map: { inline: false }
    })
  }

  canImport (filepath) {
    return filepath !== this.path && (this.isImported ? this.parent.canImport(filepath) : true)
  }

  resolveImports (cb) {
    postcss([processImports(this)]).process(this.ast, {
      from: this.path,
      map: { inline: false }
    }).then(result => {
      this.ast = result.root
      cb()
    }).catch(cb)
  }

  getTheme (name) {
    return this.themes.find(theme => theme.name === name)
  }

  hasTheme (name) {
    return this.themes.some(theme => theme.name === name)
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

    queue.add(`  Generating themed versions`, next => {
      let callback = (err, output) => {
        if (err) {
          return cb(err)
        }

        files.push(output)
        next()
      }

      if (this.make.length === 0) {
        return this.#process(this.getTheme('default'), false, callback)
      }

      this.make.forEach(make => {
        if (!this.hasTheme(make.theme)) {
          return cb(ErrorUtils.createError(Object.assign({}, make.source, {
            css: make.root.toString(),
            message: `Theme "${make.theme}" does not exist`
          })))
        }

        this.#process(this.getTheme(make.theme), true, callback)
      })

      next()
    })

    queue.run(true)
  }

  #process = (theme, includeName, cb) => {
    postcss([
      processImports(this),

      analyze(this),

      // processInlineComponentExtensions(this),

      processComponents(this),

      env({
        stage: false,
        features: {
          'custom-media-queries': {
            preserve: true
          }
        }
      }),

      handleErrors,

      processAtRules(this),

      env(Config.env),

      processFunctions({
        functions: Object.assign({}, Config.functions)
      }),

      applyNamespace,

      // require('./processors/box-model.js')(this.components),

      applyCharset(Config.charset),

      // TODO: If user specifies additional plugins, add them here

      Config.minify ? cssnano() : perfectionist({ indentSize: 2 })
    ]).process(this.ast, {
      from: this.path,
      to: path.join(Config.output, path.basename(this.path)),
      map: { inline: false }
    }).then(result => {
      cb(null, {
        path: path.join(Config.output, `${path.basename(this.path, '.css')}${includeName ? `.${theme.name}` : ''}.css`),
        css: result.css,
        map: result.map
      })
    }).catch(cb)
  }
}
