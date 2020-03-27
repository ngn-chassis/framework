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
  },

  relationships: {
    headings: new NGN.DATA.Model({
      autoid: false,

      fields: {
        1: {
          type: Number,
          default: Defaults.typography.headings['1']
        },

        2: {
          type: Number,
          default: Defaults.typography.headings['2']
        },

        3: {
          type: Number,
          default: Defaults.typography.headings['3']
        },

        4: {
          type: Number,
          default: Defaults.typography.headings['4']
        },

        5: {
          type: Number,
          default: Defaults.typography.headings['5']
        },

        6: {
          type: Number,
          default: Defaults.typography.headings['6']
        },

        legend: {
          type: Number,
          default: Defaults.typography.headings.legend
        }
      }
    })
  }
})
