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
  typesetRules = []

  #layout = this.#model.layout
  #typography = this.#model.typography
  #viewport = this.#model.viewport

  get entry () {
    return this.#model.entry
  }

  get output () {
    return this.#model.output
  }

  // TODO: Strip null values
  get json () {
    let json = Object.assign({}, this.#model.representation, {
      functions: this.functions
    })

    ;['layout', 'typography', 'viewport'].forEach(key => {
      if (json[key].disabled) {
        json[key] = false
      }
    })

    json.viewport.breakpoints.forEach(bp => {
      if (!bp.width) {
        delete bp.width
      }

      if (!bp.height) {
        delete bp.height
      }
    })

    return json
  }

  get beautify () {
    return this.#model.beautify.data
  }

  get charset () {
    return this.#model.charset
  }

  get env () {
    return this.#model.env.data
  }

  get layout () {
    return this.#layout.data
  }

  get minify () {
    return this.#model.minify
  }

  get sourceMap () {
    return this.#model.sourceMap
  }

  get typography () {
    return this.#typography.representation
  }

  get viewport () {
    return this.#viewport.representation
  }

  load (cfg, cb) {
    if (!cfg.entry) {
      return cb(ErrorUtils.createError({ message: `No entries provided` }))
    }

    if (!Array.isArray(cfg.entry)) {
      cfg.entry = [cfg.entry]
    }

    cfg.entry.forEach(file => {
      let type = NGN.typeof(file)

      if (typeof file !== 'string') {
        return cb(ErrorUtils.createError({ message: `Invalid entry configuration. Expected a filepath string but received ${type}.` }))
      }

      if (!FileUtils.fileExists(file)) {
        return cb(ErrorUtils.createError({ message: `Entry ${file} not found` }))
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

        this.#loadDefaultBreakpoints(cb)
      })

      this.#model.load(this.#process(cfg, cb))
    })

    this.#model.load(Defaults)
  }

  #loadDefaultBreakpoints = cb => {
    let { width, height } = this.layout
    let { records } = this.#viewport.breakpoints

    this.#viewport.breakpoints.once('load', () => cb(null, this.json))

    this.#viewport.breakpoints.load([
      {
        name: 'min-height',
        height: height.min
      },

      {
        name: 'max-height',
        height: height.max
      },

      {
        name: 'min-width',
        width: width.min
      },

      {
        name: 'max-width',
        width: width.max
      }
    ].filter(def => {
      return !records.some(bp => bp.name === def.name) && !['width', 'height'].every(value => !def[value])
    }))
  }

  // #storeGeneratedRanges = () => {
  //
  //
  //   // this.generatedRanges = [
  //   //   {
  //   //     type: 'height',
  //   //     name: 'min-height-and-over',
  //   //     min: height.min
  //   //   },
  //   //
  //   //   {
  //   //     type: 'height',
  //   //     name: 'min-height',
  //   //     max: height.min
  //   //   },
  //   //
  //   //   {
  //   //     type: 'height',
  //   //     name: 'over-min-height',
  //   //     min: height.min + 1
  //   //   },
  //   //
  //   //   {
  //   //     type: 'width',
  //   //     name: 'min-width-and-over',
  //   //     min: width.min
  //   //   },
  //   //
  //   //   {
  //   //     type: 'width',
  //   //     name: 'over-min-width',
  //   //     min: width.min + 1
  //   //   },
  //   //
  //   //   {
  //   //     type: 'width',
  //   //     name: 'under-max-width',
  //   //     max: width.max - 1
  //   //   },
  //   //
  //   //   {
  //   //     type: 'width',
  //   //     name: 'max-width-and-under',
  //   //     max: width.max
  //   //   },
  //   //
  //   //   {
  //   //     type: 'width',
  //   //     name: 'max-width-and-over',
  //   //     min: width.max
  //   //   },
  //   //
  //   //   {
  //   //     type: 'width',
  //   //     name: 'over-max-width',
  //   //     min: width.max + 1
  //   //   }
  //   // ]
  // }

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
