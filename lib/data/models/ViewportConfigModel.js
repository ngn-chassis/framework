import ViewportWidthRangeModel from './ViewportWidthRangeModel.js'

export default new NGN.DATA.Model({
  autoid: false,

  relationships: {
    widthRanges: [ViewportWidthRangeModel]//,
    // heightRanges: [ViewportHeightRangeModel]
  }
})
