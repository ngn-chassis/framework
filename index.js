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
    this.settings.validate()

    this.typography = new (require('./typography.js'))(this)
    this.settings.typography.ranges.load(this.typography.ranges)

    this.viewport = new (require('./viewport.js'))(this)
    this.settings.viewportWidthRanges.load(this.viewport.getWidthRanges(this.settings.layout.breakpoints))

    this.theme = new (require('./theme.js'))(this)
    this.layout = new (require('./layout.js'))(this)
    this.atRules = new (require('./at-rules.js'))(this)
    this.functions = new (require('./functions.js'))(this)
    this.post = new (require('./post.js'))(this)
    this.core = new (require('./core.js'))(this)

    this.componentExtensions = {}
    this.componentOverrides = {}
  }

  process (filepath, cb, from = void 0) {
    if (path.basename(filepath).startsWith('_')) {
      return
    }

    fs.readFile(filepath, (err, css) => {
      if (err) {
        return cb(err, null)
      }

      let styleSheet = new (require('./style-sheet.js'))(this, css.toString().trim())

      styleSheet.on('processing.error', err => cb(err, null))
      styleSheet.on('processing.complete', output => cb(null, output))
      styleSheet.process(from)
    })
  }
}
