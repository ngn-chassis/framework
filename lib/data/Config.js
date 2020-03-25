import ErrorUtils from '../utilities/ErrorUtils.js'
import FileUtils from '../utilities/FileUtils.js'

import ConfigModel from './models/ConfigModel.js'
import Constants from './Constants.js'
import Defaults from './Defaults.js'
import Functions from '../Functions.js'
import TypographyUtils from '../utilities/TypographyUtils.js'

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
    if (!Array.isArray(cfg.entry)) {
      cfg.entry = [cfg.entry]
    }

    cfg.entry.forEach(file => {
      if (!FileUtils.fileExists(file)) {
        return cb(ErrorUtils.createError({ message: `${file} not found` }))
      }
    })

    if (cfg.hasOwnProperty('functions')) {
      this.functions = Object.assign({}, this.functions, cfg.functions)
      delete cfg.functions
    }

    this.#model.once('load', () => {
      let { width } = this.#model.layout.constraints
      let { baseFontSize } = this.#model.typography.constraints

      if (width.max !== Defaults.layout.constraints.width.max) {
        this.#model.typography.constraints.baseFontSize.max = TypographyUtils.calculateOptimalFontSize(width.max, baseFontSize.min, Constants.typography.scaleRatios['golden ratio'])
      }

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
      console.log('hello?');
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

export default new Config()
