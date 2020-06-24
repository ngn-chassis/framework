import fs from 'fs-extra'
import path from 'path'

import postcss from 'postcss'
import cssnano from 'cssnano'
import perfectionist from 'perfectionist'
import env from 'postcss-preset-env'

import Stylesheet from './Stylesheet.js'
import DefaultTheme from './themes/default.js'

import QueueUtils from './utilities/QueueUtils.js'

import resolveFunctions from 'postcss-functions'
import resolveAtRules from './plugins/resolveAtRules.js'
import generateCore from './plugins/core/generateCore.js'
import cleanup from './plugins/cleanup.js'
import applyNamespace from './plugins/applyNamespace.js'

import { CONFIG } from '../index.js'

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
    let outputpath = path.join(CONFIG.output, NGN.coalesce(version.filepath, `${path.basename(this.filepath, '.css')}${theme.name !== 'default' ? `.${theme.name}` : ''}.css`))
    let output

    QueueUtils.run({
      log: false,

      tasks: [{
        name: 'Processing Theme',
        callback: next => {
          theme.getApplications((err, result) => {
            if (err) {
              return cb(err)
            }

            this.#stylesheet.registerApplications(...result)
            next()
          })
        }
      }, {
        name: 'Processing Stylesheet',
        callback: next => {
          let post = []

          if (CONFIG.minify) {
            post.push(cssnano())
          } else {
            post.push(perfectionist(CONFIG.beautify))
            post.push(cleanup)
          }

          postcss([
            resolveFunctions({ functions: CONFIG.functions }),
            resolveAtRules(this.#stylesheet, theme),
            generateCore(this.#stylesheet, theme),
            env(CONFIG.env),
            applyNamespace,
            ...post
          ]).process(root, {
            from: this.filepath,
            to: outputpath,
            map: { inline: false }
          }).then(result => {
            output = {
              path: outputpath,
              css: result.css,
              map: result.map
            }

            next()
          }).catch(cb)
        }
      }]
    })
    .then(() => cb(null, output))
    .catch(cb)
  }
}
