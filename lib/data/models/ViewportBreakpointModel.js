import Defaults from '../Defaults.js'

export default new NGN.DATA.Model({
  autoid: false,

  fields: {
    name: {
      type: String,
      default: null
    },

    width: {
      type: Number,
      default: null
    },

    height: {
      type: Number,
      default: null
    }
  }
})
