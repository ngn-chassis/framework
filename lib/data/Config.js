const ErrorUtils = require('../utilities/ErrorUtils.js')
const FileUtils = require('../utilities/FileUtils.js')

const ConfigModel = require('./models/ConfigModel.js')
const Defaults = require('./Defaults.js')
const Functions = require('../Functions.js')

class Config {
  #model = new ConfigModel()
  functions = Object.assign({}, Functions)

  get entry () {
    return this.#model.entry
  }

  get output () {
    return this.#model.output
  }

  get json () {
    return Object.assign({}, this.#model.representation, {
      functions: this.functions
    })
  }

  get charset () {
    return this.#model.charset
  }

  get env () {
    return this.#model.env.data
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
    return this.#model.typography.representation
  }

  get viewport () {
    return this.#model.viewport.representation
  }

  load (cfg, cb) {
    if (!FileUtils.fileExists(cfg.entry, false)) {
      return cb(ErrorUtils.createError({ message: `${cfg.entry} not found` }))
    }

    if (cfg.hasOwnProperty('functions')) {
      this.functions = Object.assign({}, this.functions, cfg.functions)
      delete cfg.functions
    }

    this.#model.once('load', () => {
      if (!this.#model.valid) {
        let attrs = this.#model.invalidDataAttributes

        return cb(ErrorUtils.createError({
          message: `Configuration: Invalid attribute${attrs.length > 1 ? 's' : ''}: ${attrs.join(', ')}`
        }))
      }

      cb(null, this.json)
    })

    this.#model.load(this.#process(cfg))
  }

  #getBooleanValue = (prop, value) => {
    switch (typeof value) {
      case 'boolean': return value
      case 'string':
        if (['true', 'false'].some(string => value === string)) {
          return value === 'true'
        }

        console.warn(`Config property "${prop}" expected a boolean value but received string "${value}". Defaulting to false...`)
        return false

      default: return false
    }
  }

  #process = cfg => {
    if (cfg.hasOwnProperty('layout') && typeof cfg.layout !== 'object' && !this.#getBooleanValue('layout', cfg.layout)) {
      cfg.layout = {
        disabled: true
      }
    }

    if (cfg.hasOwnProperty('typography') && typeof cfg.typography !== 'object' && !this.#getBooleanValue('typography', cfg.typography)) {
      cfg.typography = {
        disabled: true
      }
    }

    if (cfg.hasOwnProperty('viewport')) {
      console.log('TODO: Process Viewport Width Ranges')
      console.log(cfg.viewport)
    }

    return Object.assign({}, Defaults, Object.assign({}, cfg, {
      minify: this.#getBooleanValue('minify', cfg.minify),
      sourceMap: this.#getBooleanValue('sourceMap', cfg.sourceMap)
    }))
  }
}

module.exports = new Config()
