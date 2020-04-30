import fs from 'fs-extra'
import path from 'path'

import Config from './data/Config.js'
import Stylesheet from './Stylesheet.js'
import DefaultTheme from './themes/default.js'

import QueueUtils from './utilities/QueueUtils.js'

import postcss from 'postcss'
import cssnano from 'cssnano'
import perfectionist from 'perfectionist'
import env from 'postcss-preset-env'

import resolveAtRules from './processors/resolveAtRules.js'
import generateCore from './processors/generateCore.js'
import cleanup from './processors/cleanup.js'

import ComponentStore from './data/stores/ComponentStore.js'
import Tree from './Tree.js'

import FileImport from './atrules/import/FileImport.js'
import ModuleImport from './atrules/import/ModuleImport.js'

export default class Entry {
  #root = null
  #tree = new Tree()
  #files = []

  constructor (filepath) {
    this.filepath = filepath
    this.#root = new Stylesheet(postcss.parse(fs.readFileSync(filepath), { from: filepath }), filepath)
  }

  process (cb) {
    QueueUtils.queue({
      log: false,

      tasks: [
        {
          name: `Processing ${this.filepath}`,
          callback: next => QueueUtils.queue({
            pad: {
              start: '  '
            },

            tasks: [
              {
                name: `Resolving Dependencies`,
                callback: next => this.#tree.resolve(this.#root, next, cb)
              },

              // {
              //   name: 'Validating Components',
              //   callback: next => this.#validateComponents(next, cb)
              // },

              {
                name: 'Generating Themed Versions',
                callback: next => this.#generateThemedVersions(this.#root, next, cb)
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

  // #validateComponents = (resolve, reject) => {
  //   this.#tree.getComponents()
  // }

  #generateThemedVersions = (stylesheet, resolve, reject) => {
    let { versions } = this.#tree

    if (!versions.some(version => version === 'default')) {
      versions.push('default')
    }

    QueueUtils.queue({
      pad: {
        start: '    '
      },

      tasks: versions.map(version => ({
        name: `Generating "${version}" version`,
        callback: next => this.#generateThemedVersion(version, (err, result) => {
          if (err) {
            return reject(err)
          }

          this.#files.push(result)
          next()
        })
      }))
    })
    .then(resolve)
    .catch(reject)
  }

  #generateThemedVersion = (theme, cb) => {
    theme = NGN.coalesce(this.#tree.themes[theme], DefaultTheme)
    let root = this.#root.clone()
    let outputpath = path.join(Config.output, `${path.basename(this.filepath, '.css')}${theme.name !== 'default' ? `.${theme.name}` : ''}.css`)
    let post = []

    if (Config.minify) {
      post.push(cssnano())
    } else {
      post.push(perfectionist(Config.beautify))
      post.push(cleanup)
    }

    postcss([
      // resolveAtRules(stylesheet),
      generateCore(this.#tree, theme),
      // resolveAtRules(stylesheet),
      env(Config.env),
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
