const ViewportWidthRangeModel = require('./ViewportWidthRangeModel.js')

module.exports = new NGN.DATA.Model({
  autoid: false,

  relationships: {
    widthRanges: [ViewportWidthRangeModel]
  }
})
