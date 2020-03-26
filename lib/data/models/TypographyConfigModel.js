import Constants from '../Constants.js'
import Defaults from '../Defaults.js'
import ViewportWidthRangeModel from './ViewportWidthRangeModel.js'
import TypographyUtils from '../../utilities/TypographyUtils.js'

export default new NGN.DATA.Model({
  autoid: false,

  fields: {
    autoScale: {
      type: Boolean,
      default: Defaults.typography.autoScale
    },

    disabled: {
      type: Boolean,
      default: false
    },

    minFontSize: {
      type: Number,
      default: Defaults.typography.minFontSize,
      min: 0
    },

    maxFontSize: {
      type: Number,
      default: Defaults.typography.maxFontSize,
      min: 0
    },

    scaleRatio: {
      type: Number,
      default: Defaults.typography.scaleRatio,
      min: 1,
      max: 2
    }
  }
})
