import 'ngn'
import 'ngn-data'
import fs from 'fs-extra'

import Config from './lib/data/Config.js'
import Entry from './lib/Entry.js'

import FileUtils from './lib/utilities/FileUtils.js'
import QueueUtils from './lib/utilities/QueueUtils.js'

export default class Chassis {
  #cfg

  constructor (cfg) {
    this.#cfg = NGN.coalesce(cfg, {})
  }

  get entry () {
    return Config.entry
  }

  get output () {
    return Config.output
  }

  get config () {
    return Config.json
  }

  process (cb) {
    Config.load(this.#cfg, (err, cfg) => {
      if (err) {
        return cb(err)
      }

      fs.ensureDirSync(cfg.output)

      QueueUtils.run({
        tasks: Config.entries.map(entry => ({
          name: `Processing ${entry}`,

          callback: next => {
            try {
              entry = new Entry(entry)

              entry.process((err, files) => {
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
