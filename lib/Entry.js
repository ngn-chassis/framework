import fs from 'fs-extra'
import path from 'path'

import postcss from 'postcss'
import cssnano from 'cssnano'
import perfectionist from 'perfectionist'
import env from 'postcss-preset-env'
import functions from 'postcss-functions'

import Config from './data/Config.js'
import Stylesheet from './Stylesheet.js'
import DefaultTheme from './themes/default.js'

import QueueUtils from './utilities/QueueUtils.js'

import resolveAtRules from './processors/resolveAtRules.js'
import generateCore from './processors/core/generateCore.js'
// import resolveFunctions from './processors/resolveFunctions.js'
import cleanup from './processors/cleanup.js'
import applyNamespace from './processors/applyNamespace.js'

export default class Entry {
  #stylesheet = null
  #files = []

  constructor (filepath) {
    this.filepath = filepath
    this.#stylesheet = new Stylesheet(filepath)
  }

  process (cb) {
    QueueUtils.run({
      log: false,

      tasks: [
        {
          name: `Processing ${this.filepath}`,
          callback: next => QueueUtils.run({
            log: false,

            pad: {
              start: '  '
            },

            tasks: [
              {

                name: `Resolving Imports`,
                callback: next => this.#stylesheet.resolve(next, cb)
              },

              {
                name: 'Generating Themed Versions',
                callback: next => this.#generateThemedVersions(next, cb)
              }
            ]
          })
          .then(next)
          .catch(cb)
        }
      ],
    })
    .then(() => cb(null, this.#files))
    .catch(cb)
  }

  #generateThemedVersions = (resolve, reject) => {
    QueueUtils.run({
      pad: {
        start: '    '
      },

      tasks: Object.keys(this.#stylesheet.versions).map(theme => {
        let version = this.#stylesheet.versions[theme]

        return {
          name: `Generating "${version.theme}" version`,
          callback: next => this.#generateThemedVersion(version, (err, result) => {
            if (err) {
              return reject(err)
            }

            this.#files.push(result)
            next()
          })
        }
      })
    })
    .then(resolve)
    .catch(reject)
  }

  #generateThemedVersion = (version, cb) => {
    let theme = NGN.coalesce(this.#stylesheet.themes[version.theme], DefaultTheme)
    let root = this.#stylesheet.clone()
    let outputpath = path.join(Config.output, NGN.coalesce(version.filepath, `${path.basename(this.filepath, '.css')}${theme.name !== 'default' ? `.${theme.name}` : ''}.css`))
    let post = []

    if (Config.minify) {
      post.push(cssnano())
    } else {
      post.push(perfectionist(Config.beautify))
      post.push(cleanup)
    }

    postcss([
      functions({
        functions: Config.functions
      }),
      
      resolveAtRules(this.#stylesheet, theme),
      generateCore(this.#stylesheet, theme),
      env(Config.env),
      applyNamespace,
      ...post
    ]).process(root, {
      from: this.filepath,
      to: outputpath,
      map: { inline: false }
    }).then(result => {
      cb(null, {
        path: outputpath,
        css: result.css,
        map: result.map
      })
    }).catch(cb)
  }
}
