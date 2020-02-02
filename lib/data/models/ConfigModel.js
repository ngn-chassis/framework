const FileUtils = require('../../utilities/FileUtils.js')
const EnvConfigModel = require('./EnvConfigModel.js')
const LayoutConfigModel = require('./LayoutConfigModel.js')
const TypographyConfigModel = require('./TypographyConfigModel.js')
const ViewportConfigModel = require('./ViewportConfigModel.js')

const ConfigModel = new NGN.DATA.Model({
  autoid: false,

  fields: {
    boxModels: {
      type: Object,
      default: {
        inline: [],
        'inline-block': [],
        block: []
      }
    },

    charset: {
      type: String,
      default: 'UTF-8'
    },

    minify: false,
    sourceMap: false
  },

  relationships: {
    env: EnvConfigModel,
    layout: LayoutConfigModel,
    typography: TypographyConfigModel,
    viewport: ViewportConfigModel
  }
})

module.exports = ConfigModel
