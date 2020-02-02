const path = require('path')

const ConsoleUtils = require('../utilities/ConsoleUtils.js')
const ErrorUtils = require('../utilities/ErrorUtils.js')
const FileUtils = require('../utilities/FileUtils.js')

const Config = require('../Config.js')

module.exports = class StyleSheetMixins {
  /**
   * @mixin import
   * Import a file or directory of files into the style sheet.
   */
  static import (mixin, cb) {
    console.log('IMPORT');
    cb(null, '')
    // let resource = mixin.args[0]
    //
    // let content = resource.type === 'function' && resource.value === 'dir'
    //   ? FileUtils.parseDirectory(path.join(Config.importBasePath, resource.nodes.map(node => node.value).join('')), false)
    //   : FileUtils.getImportedFileContents(resource.value, Config.importBasePath)
    //
    // if (!content) {
    //   return cb(`Invalid resource "${resource.value}"`)
    // }
    //
    // cb(null, content)
  }
}
