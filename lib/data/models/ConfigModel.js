import BeautifyConfigModel from './BeautifyConfigModel.js'
import EnvConfigModel from './EnvConfigModel.js'
import LayoutConfigModel from './LayoutConfigModel.js'
import TypographyConfigModel from './TypographyConfigModel.js'
import ViewportConfigModel from './ViewportConfigModel.js'

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

    minify: false,
    sourceMap: false
  },

  relationships: {
    beautify: BeautifyConfigModel,
    env: EnvConfigModel,
    layout: LayoutConfigModel,
    typography: TypographyConfigModel,
    viewport: ViewportConfigModel
  }
})
