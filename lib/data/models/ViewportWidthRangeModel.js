const Defaults = require('../Defaults.js')

const ViewportWidthRangeBoundModel = new NGN.DATA.Model({
  autoid: false,

  fields: {
    min: {
      type: Number,

      validate (value) {
        return value < this.max
      }
    },

    max: {
      type: Number,

      validate (value) {
        return value > this.min
      }
    }
  }
})

const ViewportWidthRangeModel = new NGN.DATA.Model({
  autoid: false,

  fields: {
    name: String,
    alternateNames: Array,
  },

  relationships: {
    bounds: ViewportWidthRangeBoundModel
  }
})

module.exports = ViewportWidthRangeModel
