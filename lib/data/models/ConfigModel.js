const FileUtils = require('../../utilities/FileUtils.js')

const ConfigModel = new NGN.DATA.Model({
  fields: {
    importBasePath: {
      type: String,
      default: null,

      validate (filepath) {
        return FileUtils.isDirectory(filepath)
      }
    },

    minify: false,
    sourceMap: false
  },

  // virtuals: {
  //   test () {
  //     return 'test'
  //   }
  // }
})

module.exports = ConfigModel
