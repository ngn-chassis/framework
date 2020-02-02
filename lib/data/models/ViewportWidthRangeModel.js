const ViewportWidthRangeBoundModel = new NGN.DATA.Model({
  autoid: false,

  fields: {
    min: Number,
    max: Number
  }
})

const ViewportWidthRangeModel = new NGN.DATA.Model({
  autoid: false,

  fields: {
    name: String,
    alternateNames: Array//,
    // typography: Object
  },

  relationships: {
    bounds: [ViewportWidthRangeBoundModel]
  }
})

module.exports = ViewportWidthRangeModel
