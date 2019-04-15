require('ngn')
require('ngn-data')

const fs = require('fs')
const path = require('path')

module.exports = class Chassis extends NGN.EventEmitter {
  constructor (cfg = null) {
    super()

    this.utils = require('./utilities.js')
    this.constants = require('./constants.js')

    this.settings = new (require('./settings.js'))(this)
    this.settings.load(NGN.coalesce(cfg, {}))

    this.typography = new (require('./typography.js'))(this)
    this.settings.typography.ranges.load(this.typography.ranges)

    this.viewport = new (require('./viewport.js'))(this)
    this.settings.viewportWidthRanges.load(this.viewport.getWidthRanges(this.settings.layout.breakpoints))

    this.imports = []
    this.theme = new (require('./theme.js'))(this)
    this.layout = new (require('./layout.js'))(this)
    this.atRules = new (require('./at-rules.js'))(this)
    this.functions = new (require('./functions.js'))(this)
    this.post = new (require('./post.js'))(this)

    this.componentExtensions = new (require('./data/stores/component-extensions.js'))
    this.componentOverrides = new (require('./data/stores/component-overrides.js'))
  }

  // handleError (data) {
  //   let error = this.utils.console.createError(data)
  //   throw error
  // }

  process (filepath = void 0, cb) {
    if (path.basename(filepath).startsWith('_')) {
      return
    }

    if (!this.settings.importBasePath) {
      this.settings.importBasePath = path.dirname(filepath)
    }

    this.settings.on('validation.failed', invalidAttributes => {
      if (this.invalidAttributes.includes('theme')) {
        console.warn(`[WARNING] Chassis Theme: "${this.theme}" is not a valid theme file. Chassis themes must have a ".theme" extension. Reverting to default theme...`)
        this.settings.theme = this.constants.theme.defaultFilePath
        return this.settings.validate()
      }

      cb(this.utils.console.createError({
        message: 'Chassis Configuration: Invalid fields:/n' + invalidAttributes.join(', ')
      }))
    })

    this.settings.on('validation.succeeded', () => {
      fs.readFile(filepath, (err, css) => {
        if (err) {
          return cb(err, null)
        }

        let styleSheet = new (require('./style-sheet.js'))(this, css.toString().trim())

        styleSheet.on('processing.complete', output => cb(null, output))

        try {
          styleSheet.process(filepath)
        } catch (err) {
          cb(err, null)
        }
      })
    })

    this.settings.validate()
  }
}
