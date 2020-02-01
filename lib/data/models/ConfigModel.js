const FileUtils = require('../../utilities/FileUtils.js')
const EnvModel = require('./EnvModel.js')

const ConfigModel = new NGN.DATA.Model({
  autoid: false,

  fields: {
    charset: {
      type: String,
      default: 'UTF-8'
    },

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

  relationships: {
    env: EnvModel
  }

  // virtuals: {
  //   test () {
  //     return 'test'
  //   }
  // }
})

module.exports = ConfigModel
