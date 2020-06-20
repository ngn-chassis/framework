import 'ngn'
import 'ngn-data'
import fs from 'fs-extra'

import Config from './lib/data/Config.js'
import Entry from './lib/Entry.js'

import FileUtils from './lib/utilities/FileUtils.js'
import QueueUtils from './lib/utilities/QueueUtils.js'

const CONFIG = new Config()

export default class Chassis {
  #cfg

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
    CONFIG.load(this.#cfg, err => {
      if (err) {
        return cb(err)
      }

      fs.ensureDirSync(CONFIG.output)

      QueueUtils.run({
        tasks: CONFIG.entries.map(entry => ({
          name: `Processing ${entry}`,

          callback: next => {
            try {
              new Entry(entry).process((err, files) => {
                if (err) {
                  return cb(err)
                }

                this.#writeFiles(files, next, cb)
              })
            } catch (err) {
              cb(err)
            }
          }
        }))
      })
      .then(cb)
      .catch(cb)
    })
  }

  #writeFiles = (files, resolve, reject) => QueueUtils.run({
    pad: {
      start: '  '
    },

    tasks: files.reduce((tasks, file) => {
      let write = (filepath, contents, cb) => {
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
          callback: next => write(`${file.path}.map`, file.map, next)
        })
      }

      return tasks
    }, [])
  })
  .then(resolve)
  .catch(reject)
}

export { CONFIG }
