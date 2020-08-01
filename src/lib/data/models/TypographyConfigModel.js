import Defaults from '../Defaults.js'

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
        h1: {
          type: Number,
          default: Defaults.typography.headings['1']
        },

        h2: {
          type: Number,
          default: Defaults.typography.headings['2']
        },

        h3: {
          type: Number,
          default: Defaults.typography.headings['3']
        },

        h4: {
          type: Number,
          default: Defaults.typography.headings['4']
        },

        h5: {
          type: Number,
          default: Defaults.typography.headings['5']
        },

        h6: {
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
