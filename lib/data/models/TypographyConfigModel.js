const MustHave = require('musthave')
const FontSizeModel = require('./FontSizeModel.js')
const ViewportWidthRangeModel = require('./ViewportWidthRangeModel.js')
const Defaults = require('../Defaults.js')

module.exports = new NGN.DATA.Model({
  autoid: false,

  fields: {
    // baseFontSize: {
    //   type: Number,
    //   default: Defaults.typography.baseFontSize,
    //   min: 1
    // },

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
      min: 0
    }
  },

  relationships: {
    // fontSizes: FontSizeModel,
    ranges: [ViewportWidthRangeModel]
  }
})
