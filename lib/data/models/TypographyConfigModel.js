import Defaults from '../Defaults.js'
import ViewportWidthRangeModel from './ViewportWidthRangeModel.js'

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
              default: Defaults.typography.constraints.baseFontSize.max,
              min: 0
            }//,

            // increment: {
            //   type: Number,
            //   default: Defaults.typography.constraints.baseFontSize.increment
            // }
          }
        })
      }
    })
  }
})
