const ConfigModel = require('./data/models/ConfigModel.js')

class Config {
  #model = new ConfigModel()

  get json () {
    return this.#model.representation
  }

  get boxModels () {
    return this.#model.boxModels
  }

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

  get layout () {
    return this.#model.layout.data
  }

  get minify () {
    return this.#model.minify
  }

  get sourceMap () {
    return this.#model.sourceMap
  }

  get typography () {
    return this.#model.typography.data
  }

  load (data, cb) {
    // console.log(JSON.stringify(data, null, 2));
    this.#model.once('load', () => cb && cb(this.json))
    this.#model.load(data)
  }
}

module.exports = new Config()
