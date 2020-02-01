const ConfigModel = require('./data/models/ConfigModel.js')

class Config {
  #model = new ConfigModel()

  get charset () {
    return this.#model.charset
  }

  get env () {
    return this.#model.env.data
  }

  get isValid () {
    return this.#model.valid
  }

  get invalidAttributes () {
    return this.#model.invalidDataAttributes
  }

  get importBasePath () {
    return this.#model.importBasePath
  }

  get minify () {
    return this.#model.minify
  }

  get sourceMap () {
    return this.#model.sourceMap
  }

  load (data, cb) {
    this.#model.once('load', cb)
    this.#model.load(data)
  }
}

module.exports = new Config()
