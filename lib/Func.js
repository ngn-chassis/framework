const ErrorUtils = require('./utilities/ErrorUtils.js')
const Functions = require('./Functions.js')

module.exports = class Func {
  #data
  #decl
  #parsed

  constructor (data, source) {
    this.#data = data

    this.name = data.value
    this.args = data.nodes
    this.source = source
  }

  resolve (cb) {
    if (!Functions.hasOwnProperty(this.name)) {
      return
    }

    if (this.args.length === 0) {
      return cb(ErrorUtils.createError({
        line: this.source.line,
        message: `Function "${this.name}" received no argument`
      }))
    }

    cb(null, Functions[this.name](this.args.map(arg => arg.value)))
  }
}
