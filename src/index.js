import 'ngn'
import 'ngn-data'
import fs from 'fs-extra'

import Config from './lib/data/Config.js'
import Entry from './lib/Entry.js'

import FileUtils from './lib/utilities/FileUtils.js'
import QueueUtils from './lib/utilities/QueueUtils.js'

let CONFIG

export default class Chassis {
  #cfg = null

  constructor (cfg) {
    this.#cfg = NGN.coalesce(cfg, {})
  }

  get entry () {
    return CONFIG.entry
  }

  get output () {
    return CONFIG.output
  }

  get config () {
    return CONFIG.json
  }

  process (cb) {
    CONFIG = new Config()

    CONFIG.load(this.#cfg, err => {
      if (err) {
        return cb(err)
      }

      fs.ensureDirSync(CONFIG.output)
      const files = []

      QueueUtils.run({
        tasks: CONFIG.entries.map((filepath, i) => ({
          name: `Processing Entry ${i + 1}: ${filepath}`,
          callback: next => this.#processEntry(new Entry(filepath), results => {
            files.push(...results)
            next()
          }, cb)
        }))
      }).then(() => {
        this.#writeFiles(files, cb)
      }).catch(cb)
    })
  }

  #processEntry = (entry, resolve, reject) => {
    let output

    const callback = (err, next) => {
      if (err) {
        return reject(err)
      }

      next()
    }

    QueueUtils.run({
      tasks: [{
        name: '|-- Resolving Imports',
        callback: next => entry.resolveImports(err => callback(err, next))
      }, {
        name: '|-- Analyzing',
        callback: next => entry.analyze(err => callback(err, next))
      }, {
        name: '|-- Generating Output',
        callback: next => entry.render((err, result) => {
          if (err) {
            return reject(err)
          }

          output = result
          next()
        })
      }]
    }).then(() => {
      resolve(Array.isArray(output) ? output : [output])
    }).catch(reject)
  }

  #writeFiles = (files, cb) => QueueUtils.run({
    pad: {
      start: '  '
    },

    tasks: files.reduce((tasks, file) => {
      const write = (filepath, contents, cb) => {
        fs.ensureDirSync(FileUtils.getFilePath(filepath))
        fs.writeFile(filepath, contents, cb)
      }

      tasks.push({
        name: `Writing ${file.path}`,
        callback: next => write(file.path, file.css, next)
      })

      if (file.map) {
        tasks.push({
          name: `Writing sourcemap to ${file.path}.map`,
          callback: next => write(`${file.path}.map`, file.map.toString(), next)
        })
      }

      return tasks
    }, [])
  }).then(cb).catch(cb)
}

export { CONFIG }
