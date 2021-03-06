import Defaults from '../Defaults.js'
import BeautifyConfigModel from './BeautifyConfigModel.js'
import EnvConfigModel from './EnvConfigModel.js'
import LayoutConfigModel from './LayoutConfigModel.js'
import TypographyConfigModel from './TypographyConfigModel.js'
import ViewportModel from './ViewportModel.js'

export default new NGN.DATA.Model({
  autoid: false,

  fields: {
    entry: Array,
    output: {
      type: String,
      required: false
    },

    charset: {
      type: String,
      default: 'UTF-8'
    },

    scope: {
      type: String,
      default: Defaults.scope
    },

    minify: {
      type: Boolean,
      default: false
    },

    sourceMap: {
      type: Boolean,
      default: false
    },

    lint: {
      type: Boolean,
      default: false
    },

    validFileExtensions: {
      type: Array,
      default: Defaults.validFileExtensions
    },

    verbose: {
      type: Boolean,
      default: false
    }
  },

  relationships: {
    beautify: BeautifyConfigModel,
    env: EnvConfigModel,
    layout: LayoutConfigModel,
    typography: TypographyConfigModel,
    viewports: [ViewportModel]
  }
})
