import Defaults from '../Defaults.js'

export default new NGN.DATA.Model({
  autoid: false,

  fields: {
    name: String,

    alternateNames: {
      type: Array,
      default: []
    },

    fontSize: {
      type: Number,
      default: null
    }
  },

  relationships: {
    bounds: new NGN.DATA.Model({
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
  }
})
