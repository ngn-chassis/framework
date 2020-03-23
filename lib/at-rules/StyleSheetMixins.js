const path = require('path')
const glob = require("glob")

const ConsoleUtils = require('../utilities/ConsoleUtils.js')
const ErrorUtils = require('../utilities/ErrorUtils.js')
const FileUtils = require('../utilities/FileUtils.js')

const Config = require('../data/Config.js')

module.exports = class StyleSheetMixins {
  /**
   * @mixin import
   * Import a file or directory of files into the style sheet.
   */
  static import (mixin, cb) {
    let filepath = path.join(path.dirname(mixin.source.file), mixin.args[0].value)

    glob(filepath, (err, filepaths) => {
      if (err) {
        return cb(err)
      }

      filepaths = filepaths.filter(filepath => {
        if (filepath === mixin.source.file) {
          return false
        }

        if (!FileUtils.fileExists(filepath)){
          return cb(ErrorUtils.createError({
            file: this.path,
            line: mixin.source.line,
            mixin: 'import',
            message: `"${filepath}" not found`
          }))
        }

        return true
      })

      cb(null, filepaths)
    })
  }
}
