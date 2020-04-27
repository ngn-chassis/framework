import 'ngn'
import 'ngn-data'
import fs from 'fs-extra'
import Config from './lib/data/Config.js'
import Entry from './lib/Entry.js'
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

      QueueUtils.queue({
        tasks: Config.entries.map(entry => ({
          name: `Processing ${entry}`,

          callback: next => {
            try {
              entry = new Entry(entry)

              entry.process((err, files) => {
                if (err) {
                  return cb(err)
                }

                QueueUtils.queue({
                  tasks: files.reduce((tasks, file) => {
                    tasks.push({
                      name: `Writing ${file.path}`,
                      callback: next => fs.writeFile(file.path, file.css, next)
                    })

                    if (file.map) {
                      tasks.push({
                        name: `Writing Sourcemap to ${file.path}.map`,
                        callback: next => fs.writeFile(`${file.path}.map`, file.map, next)
                      })
                    }

                    return tasks
                  }, [])
                })
                .then(next)
                .catch(cb)
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
}

// module.exports = class Chassis extends NGN.EventEmitter {
//   constructor (cfg = null) {
//     super()
//
//     this.utils = require('./utilities.js')
//     this.constants = require('./constants.js')
//
//     this.Config = new (require('./Config.js'))(this)
//     this.Config.load(NGN.coalesce(cfg, {}))
//
//     this.typography = new (require('./typography.js'))(this)
//     this.Config.typography.ranges.load(this.typography.ranges)
//
//     this.viewport = new (require('./viewport.js'))(this)
//     this.Config.viewportWidthRanges.load(this.viewport.getWidthRanges(this.Config.layout.breakpoints))
//
//     this.imports = []
//     this.theme = new (require('./theme.js'))(this)
//     this.layout = new (require('./layout.js'))(this)
//     this.atRules = new (require('./at-rules.js'))(this)
//     this.functions = new (require('./functions.js'))(this)
//     this.post = new (require('./post.js'))(this)
//
//     this.componentExtensions = new (require('./data/stores/component-extensions.js'))
//     this.componentOverrides = new (require('./data/stores/component-overrides.js'))
//   }
//
//   // handleError (data) {
//   //   let error = this.utils.console.createError(data)
//   //   throw error
//   // }
//
//   process (filepath = void 0, cb) {
//     if (path.basename(filepath).startsWith('_')) {
//       return cb(null, null)
//     }
//
//     if (!this.Config.importBasePath) {
//       this.Config.importBasePath = path.dirname(filepath)
//     }
//
//     this.Config.on('validation.failed', invalidAttributes => {
//       if (this.invalidAttributes.includes('theme')) {
//         console.warn(`[WARNING] Chassis Theme: "${this.theme}" is not a valid theme file. Chassis themes must have a ".theme" extension. Reverting to default theme...`)
//         this.Config.theme = this.constants.theme.defaultFilePath
//         return this.Config.validate()
//       }
//
//       cb(this.utils.console.createError({
//         message: 'Chassis Configuration: Invalid fields:/n' + invalidAttributes.join(', ')
//       }))
//     })
//
//     this.Config.on('validation.succeeded', () => {
//       fs.readFile(filepath, (err, css) => {
//         if (err) {
//           return cb(err, null)
//         }
//
//         let stylesheet = new (require('./style-sheet.js'))(this, css.toString().trim())
//
//         stylesheet.on('processing.complete', output => cb(null, output))
//
//         try {
//           stylesheet.process(filepath)
//         } catch (err) {
//           cb(err, null)
//         }
//       })
//     })
//
//     this.Config.validate()
//   }
// }
