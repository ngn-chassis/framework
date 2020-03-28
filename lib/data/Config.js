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
    let json = Object.assign({}, this.#model.representation, {
      functions: this.functions
    })

    ;['layout', 'typography', 'viewport'].forEach(key => {
      if (json[key].disabled) {
        json[key] = false
      }
    })

    return json
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
    if (!cfg.entry) {
      return cb(ErrorUtils.createError({ message: `No entries provided` }))
    }

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
      this.#model.once('load', () => {
        if (!this.#model.valid) {
          let attrs = this.#model.invalidDataAttributes

          return cb(ErrorUtils.createError({
            message: `Configuration: Invalid attribute${attrs.length > 1 ? 's' : ''}: ${attrs.join(', ')}`
          }))
        }

        this.#storeGeneratedRanges()
        cb(null, this.json)
      })

      this.#model.load(this.#process(cfg, cb))
    })

    this.#model.load(Defaults)
  }

  #storeGeneratedRanges = () => {
    let { width, height } = this.layout

    this.generatedRanges = [
      {
        type: 'height',
        name: 'min-height-and-over',
        bounds: {
          min: height.min
        }
      },

      {
        type: 'height',
        name: 'over-min-height',
        bounds: {
          min: height.min + 1
        }
      },

      {
        type: 'width',
        name: 'min-width-and-over',
        bounds: {
          min: width.min
        }
      },

      {
        type: 'width',
        name: 'over-min-width',
        bounds: {
          min: width.min + 1
        }
      },

      {
        type: 'width',
        name: 'under-max-width',
        bounds: {
          max: width.max - 1
        }
      },

      {
        type: 'width',
        name: 'max-width-and-under',
        bounds: {
          max: width.max
        }
      },

      {
        type: 'width',
        name: 'max-width-and-over',
        bounds: {
          min: width.max
        }
      },

      {
        type: 'width',
        name: 'over-max-width',
        bounds: {
          min: width.max + 1
        }
      }
    ]
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

  #processObjects = (cfg, cb, ...keys) => {
    keys.forEach(key => {
      if (!cfg.hasOwnProperty(key)) {
        return
      }

      if (typeof cfg[key] !== 'object') {
        if (!this.#getBooleanValue(key, cfg[key])) {
          cfg[key] = {
            disabled: true
          }

          return
        }

        return cb(ErrorUtils.createError({
          message: `Invalid ${key} configuration: Expected object but received ${NGN.typeof(cfg[key])}}`
        }))
      }
    })
  }

  #process = (cfg, cb) => {
    this.#processObjects(cfg, cb, 'layout', 'typography', 'viewport')

    return Object.assign({}, cfg, {
      minify: this.#getBooleanValue('minify', cfg.minify),
      sourceMap: this.#getBooleanValue('sourceMap', cfg.sourceMap)
    })
  }
}

export default new Config()
