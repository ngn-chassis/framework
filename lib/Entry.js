import fs from 'fs-extra'
import path from 'path'

import Config from './data/Config.js'
import Stylesheet from './Stylesheet.js'
import DefaultTheme from './themes/default.js'

import postcss from 'postcss'
import cssnano from 'cssnano'
import perfectionist from 'perfectionist'
import env from 'postcss-preset-env'

import resolveTree from './processors/resolveTree.js'
import resolveComponents from './processors/resolveComponents.js'

export default class Entry {
  #files = []
  #paths = []
  #stylesheets = []

  constructor (paths) {
    this.#paths = NGN.typeof(paths) === 'array' ? paths : [paths]
  }

  process (cb) {
    let queue = new NGN.Tasks()

    queue.on('complete', () => cb(null, this.#files))

    this.#paths.forEach(filepath => {
      let stylesheet = new Stylesheet({ filepath })

      queue.add(`Analyzing`, next => {
        stylesheet.analyze(err => {
          if (err) {
            return cb(err)
          }

          next()
        })
      })

      queue.add(`Validating`, next => {
        stylesheet.validate(err => {
          if (err) {
            return cb(err)
          }

          this.#stylesheets.push(stylesheet)
          next()
        })
      })

      queue.add(`Processing`, next => {
        this.#processStylesheet(stylesheet, err => {
          if (err) {
            return cb(err)
          }

          next()
        })
      })
    })

    queue.run(true)
  }

  #processStylesheet = (stylesheet, cb) => {
    let files = []
    let queue = new NGN.Tasks()
    let { versions } = stylesheet
    let root = stylesheet.root.clone()

    queue.on('complete', () => {
      this.#files.push(...files)
      cb()
    })

    if (!versions.some(version => version === 'default')) {
      versions.push('default')
    }

    versions.forEach(version => {
      queue.add(`Resolving "${version}" version`, next => {
        this.#resolveStylesheet(stylesheet, root.clone(), version, true, (err, output) => {
          if (err) {
            return cb(err)
          }

          files.push(output)
          next()
        })
      })
    })

    queue.run(true)
  }

  #resolveStylesheet = (stylesheet, root, themeName, appendThemeName, cb) => {
    let { filepath } = stylesheet
    let theme = NGN.coalesce(stylesheet.getTheme(themeName), DefaultTheme)
    let outputpath = path.join(Config.output, `${path.basename(filepath, '.css')}${appendThemeName && theme.name !== 'default' ? `.${theme.name}` : ''}.css`)

    postcss([
      resolveTree(stylesheet, theme),
      // resolveComponents(original, theme),
      env(Config.env),
      Config.minify ? cssnano() : perfectionist(Config.beautify)
    ]).process(root, {
      from: filepath,
      to: outputpath,
      map: { inline: false }
    }).then(result => cb(null, {
      path: outputpath,
      css: result.css,
      map: result.map
    })).catch(cb)
  }
}
