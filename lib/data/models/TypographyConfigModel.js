import Constants from '../Constants.js'
import Defaults from '../Defaults.js'
import ViewportWidthRangeModel from './ViewportWidthRangeModel.js'
import TypographyUtils from '../../utilities/TypographyUtils.js'

export default new NGN.DATA.Model({
  autoid: false,

  fields: {
    baseFontSize: {
      type: Number,
      default: Defaults.typography.baseFontSize,
      min: 0
    },

    disabled: {
      type: Boolean,
      default: false
    },

    scaleRatio: {
      type: Number,
      default: Defaults.typography.scaleRatio,
      min: 1,
      max: 2
    }
  }
})
