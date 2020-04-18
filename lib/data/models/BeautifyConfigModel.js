import Defaults from '../Defaults.js'

export default new NGN.DATA.Model({
  autoid: false,

  fields: {
    indentSize: {
      type: Number,
      default: Defaults.beautify.indentSize
    }
  }
})
