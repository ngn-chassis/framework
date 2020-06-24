import Constants from '../Constants.js'
import Defaults from '../Defaults.js'
import TypographyUtils from '../../utilities/TypographyUtils.js'

export default new NGN.DATA.Model({
  autoid: false,

  fields: {
    baseFontSize: {
      type: Number,
      default: Defaults.typography.baseFontSize
    },

    charConstant: {
      type: Number,
      default: Defaults.typography.charConstant
    },

    cpl: {
      type: Number,
      default: Defaults.typography.cpl
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
    },

    smoothScaling: {
      type: Boolean,
      default: Defaults.typography.smoothScaling
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
