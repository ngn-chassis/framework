import fs from 'fs-extra'
import path from 'path'

import Config from './data/Config.js'
import Stylesheet from './Stylesheet.js'
import defaultTheme from './themes/default.js'

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

      queue.add('Initializing Default Theme', next => {
        let theme = postcss.parse(defaultTheme, { from: void 0 })
        theme.source.input.id = 'default theme'
        stylesheet.prepend(theme)
        next()
      })

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
        this.#processStylesheet(stylesheet, next)
      })
    })

    queue.run(true)
  }

  #processStylesheet = (stylesheet, cb) => {
    let files = []
    let queue = new NGN.Tasks()

    // queue.on('taskstart', task => console.log(`${task.name}...`))

    queue.on('complete', () => {
      // console.log('Done.\n');
      this.#files.push(...files)
      cb()
    })

    queue.add(`  Generating themed versions`, next => {
      let { components, imports, themes, versions } = stylesheet

      if (versions.length === 0) {
        return this.#resolveStylesheet(stylesheet, 'default', false, (err, output) => {
          if (err) {
            return cb(err)
          }

          files.push(output)
          next()
        })
      }

      this.#resolveVersions(stylesheet, versions, (err, output) => {
        if (err) {
          return cb(err)
        }

        files.push(...output)
        next()
      })
    })

    queue.run(true)
  }

  #resolveVersions = (stylesheet, versions, cb) => {
    let files = []
    let queue = new NGN.Tasks()

    queue.on('complete', () => cb(null, files))

    versions.forEach(version => {
      queue.add(`Resolving "${version}" version`, next => {
        this.#resolveStylesheet(stylesheet, version.theme, true, (err, output) => {
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

  #resolveStylesheet = (stylesheet, theme, appendThemeName, cb) => {
    let { filepath, root } = stylesheet
    theme = stylesheet.getTheme(theme)

    postcss([
      resolveTree(stylesheet, theme),
      resolveComponents(stylesheet, theme),
      env(Config.env),
      Config.minify ? cssnano() : perfectionist(Config.beautify)
    ]).process(root, {
      from: filepath,
      to: path.join(Config.output, path.basename(filepath)),
      map: { inline: false }
    }).then(result => cb(null, {
      path: path.join(Config.output, `${path.basename(filepath, '.css')}${appendThemeName && theme.name !== 'default' ? `.${theme.name}` : ''}.css`),
      css: result.css,
      map: result.map
    }))
  }
}
