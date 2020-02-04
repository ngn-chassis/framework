require('ngn')
require('ngn-data')

const fs = require('fs-extra')
const path = require('path')

const ConsoleUtils = require('./lib/utilities/ConsoleUtils.js')
const ErrorUtils = require('./lib/utilities/ErrorUtils.js')
const FileUtils = require('./lib/utilities/FileUtils.js')
const ViewportUtils = require('./lib/utilities/ViewportUtils.js')

const Config = require('./lib/Config.js')
const Defaults = require('./lib/data/Defaults.js')

const StyleSheet = require('./lib/StyleSheet.js')

module.exports = class Chassis {
  #cfg

  constructor (cfg) {
    this.#cfg = NGN.coalesce(cfg, {})
    Config.load(this.#processConfig(this.#cfg))
  }

  get config () {
    return Config.json
  }

  process (filepath = void 0, cb) {
    if (!Config.isValid) {
      let attrs = Config.invalidAttributes

      return cb(ErrorUtils.createError({
        message: `Chassis Configuration: Invalid attribute${attrs.length > 1 ? 's' : ''}: ${attrs.join(', ')}`
      }))
    }

    // Skip imports
    if (path.basename(filepath).startsWith('_')) {
      return cb()
    }

    if (!FileUtils.fileExists(filepath, false)) {
      return cb(ErrorUtils.createError({ message: `${filepath} not found` }))
    }

    let styleSheet = new StyleSheet(filepath)
    styleSheet.process(cb)
  }

  #getBooleanConfigValue = (prop, value) => {
    switch (typeof value) {
      case 'boolean': return value
      case 'string':
        if (['true', 'false'].some(string => value === string)) {
          return value === 'true'
        }

        console.warn(`Config property "${prop}" expects a boolean value but received string "${value}". Defaulting to false...`)
        return false

      default: return false
    }
  }

  #processConfig = cfg => {
    if (cfg.hasOwnProperty('layout') && typeof cfg.layout !== 'object' && !this.#getBooleanConfigValue('layout', cfg.layout)) {
      cfg.layout = {
        disabled: true
      }
    }

    if (cfg.hasOwnProperty('typography') && typeof cfg.typography !== 'object' && !this.#getBooleanConfigValue('typography', cfg.typography)) {
      cfg.typography = {
        disabled: true
      }
    }

    console.log(cfg);

    return Object.assign({}, Defaults, Object.assign({}, cfg, {
      // importBasePath: NGN.coalesce(cfg.importBasePath, path.dirname(filepath)),
      minify: this.#getBooleanConfigValue('minify', cfg.minify),
      sourceMap: this.#getBooleanConfigValue('sourceMap', cfg.sourceMap)
    }))
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
//         let styleSheet = new (require('./style-sheet.js'))(this, css.toString().trim())
//
//         styleSheet.on('processing.complete', output => cb(null, output))
//
//         try {
//           styleSheet.process(filepath)
//         } catch (err) {
//           cb(err, null)
//         }
//       })
//     })
//
//     this.Config.validate()
//   }
// }
