import Constants from '../Constants.js'
import Defaults from '../Defaults.js'
import ViewportWidthRangeModel from './ViewportWidthRangeModel.js'
import TypographyUtils from '../../utilities/TypographyUtils.js'

export default new NGN.DATA.Model({
  autoid: false,

  fields: {
    disabled: {
      type: Boolean,
      default: false
    },

    scaleRatio: {
      type: Number,
      default: Defaults.typography.scaleRatio,
      min: 0
    }
  },

  relationships: {
    constraints: new NGN.DATA.Model({
      autoid: false,

      relationships: {
        baseFontSize: new NGN.DATA.Model({
          autoid: false,

          fields: {
            min: {
              type: Number,
              default: Defaults.typography.constraints.baseFontSize.min,
              min: 0
            },

            max: {
              type: Number,
              default: TypographyUtils.calculateOptimalFontSize(Defaults.layout.constraints.width.max, Defaults.typography.constraints.baseFontSize.min, Constants.typography.scaleRatios['golden ratio']),
              min: 0
            }
          }
        })
      }
    })
  }
})
