import ViewportRangeModel from './ViewportRangeModel.js'
import ViewportBreakpointModel from './ViewportBreakpointModel.js'

export default new NGN.DATA.Model({
  autoid: false,

  relationships: {
    breakpoints: [ViewportBreakpointModel],
    ranges: [ViewportRangeModel]
  }
})
