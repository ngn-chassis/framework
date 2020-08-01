import ErrorUtils from '../utilities/ErrorUtils.js'
import FileUtils from '../utilities/FileUtils.js'

import ConfigModel from './models/ConfigModel.js'
import Defaults from './Defaults.js'
import Functions from '../Functions.js'

import CoreModule from '../modules/core.js'
import ComponentsModule from '../modules/components.js'

export default class Config {
  #functions = Object.assign({}, Functions)
  #model = new ConfigModel()

  #modules = {
    internal: {
      core: new CoreModule(),
      components: new ComponentsModule()
    },

    custom: {}
  }

  #layout = this.#model.layout
  #typography = this.#model.typography
  #viewports = this.#model.viewports
  #loaded = false

  get functions () {
    return this.#functions
  }

  set functions (functions) {
    this.#functions = functions
  }

  get modules () {
    return this.#modules
  }

  get verbose () {
    return this.#model.verbose
  }

  get lint () {
    return this.#model.lint
  }

  get loaded () {
    return this.#loaded
  }

  get scope () {
    return this.#model.scope
  }

  get entries () {
    return this.#model.entry
  }

  get output () {
    return this.#model.output
  }

  // TODO: Strip null values
  get json () {
    const json = Object.assign({}, this.#model.representation, {
      functions: this.#functions
    })

    ;['layout', 'typography', 'viewports'].forEach(key => {
      if (json[key].disabled) {
        json[key] = false
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

  get validFileExtensions () {
    return this.#model.validFileExtensions
  }

  get viewports () {
    return this.#viewports.records.map(viewport => viewport.representation)
  }

  load (cfg, cb) {
    if (!cfg.entry) {
      return cb(ErrorUtils.createError({ message: 'No entries provided' }))
    }

    if (!Array.isArray(cfg.entry)) {
      cfg.entry = [cfg.entry]
    }

    cfg.entry.forEach(file => {
      const type = NGN.typeof(file)

      if (typeof file !== 'string') {
        return cb(ErrorUtils.createError({ message: `Invalid entry configuration. Expected a filepath string but received ${type}.` }))
      }

      if (!FileUtils.fileExists(file)) {
        return cb(ErrorUtils.createError({ message: `Entry ${file} not found` }))
      }
    })

    if (Reflect.has(cfg, 'functions')) {
      // TODO: Validate
      this.functions = Object.assign({}, this.#functions, cfg.functions)
      delete cfg.functions
    }

    if (Reflect.has(cfg, 'modules')) {
      // TODO: Validate
      this.#modules.custom = cfg.modules
      delete cfg.modules
    }

    const defaults = Object.assign({}, Defaults)
    delete defaults.breakpoints

    this.#model.once('load', () => {
      this.#model.once('load', () => {
        if (!this.#model.valid) {
          const attrs = this.#model.invalidDataAttributes

          return cb(ErrorUtils.createError({
            message: `Invalid configuration attribute${attrs.length > 1 ? 's' : ''}: ${attrs.join(', ')}`
          }))
        }

        this.#loaded = true
        cb(null, this.json)
      })

      this.#model.load(this.#process(Object.assign({}, cfg, {
        breakpoints: Defaults.breakpoints
      }), cb))
    })

    this.#model.load(defaults)
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
      if (!Reflect.has(cfg, key)) {
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
    this.#processObjects(cfg, cb, 'layout', 'typography')

    cfg.viewports = this.#generateViewports(Reflect.has(cfg, 'breakpoints') ? cfg.breakpoints : Defaults.breakpoints, 0, cb)
    delete cfg.breakpoints

    return Object.assign({}, cfg, {
      minify: this.#getBooleanValue('minify', cfg.minify),
      sourceMap: this.#getBooleanValue('sourceMap', cfg.sourceMap)
    })
  }

  #generateViewports = (cfg, min = 0, reject) => {
    if (NGN.typeof(cfg[0]) !== 'number') {
      cfg.unshift(min)
    }

    const breakpoints = []
    const viewports = []

    cfg.forEach((entry, index) => {
      const type = NGN.typeof(entry)

      if (index > 0 && NGN.typeof(cfg[index - 1]) === type) {
        return reject(ErrorUtils.createError({
          message: 'Invalid breakpoint configuration. Entries must alternate between type number and type object'
        }))
      }

      switch (type) {
        case 'number': return breakpoints.push(entry)
        case 'object': return viewports.push(entry)
        default: return reject(ErrorUtils.createError({
          message: `Invalid breakpoint configuration: Expected type object or number but received type ${type}}`
        }))
      }
    })

    const final = []

    breakpoints.forEach((breakpoint, index) => {
      const set = []
      const viewport = Object.assign({}, viewports[index])
      const next = viewports[index + 1]

      if (!Reflect.has(viewport, 'bounds')) {
        viewport.bounds = {}
      }

      viewport.bounds.min = breakpoint

      if (next) {
        viewport.bounds.max = breakpoints[index + 1] - 1
      }

      if (Reflect.has(viewport, 'breakpoints')) {
        viewport.type = 'group'

        set.push(...this.#generateViewports(viewport.breakpoints, min, reject).map(viewport => {
          if (viewport.bounds.min === 0) {
            viewport.bounds.min = breakpoint
          }

          if (!viewport.bounds.max) {
            viewport.bounds.max = next ? breakpoints[index + 1] - 1 : this.layout.width.max
          }

          return viewport
        }))

        if (!viewport.bounds.max) {
          viewport.bounds.max = this.layout.width.max
        }

        delete viewport.breakpoints
      }

      set.push(viewport)
      final.push(...set)
    })

    return final
  }
}
