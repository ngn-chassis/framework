import ErrorUtils from '../utilities/ErrorUtils.js'
import FileUtils from '../utilities/FileUtils.js'

import ConfigModel from './models/ConfigModel.js'
import Constants from './Constants.js'
import Defaults from './Defaults.js'
import Functions from '../Functions.js'
import TypographyUtils from '../utilities/TypographyUtils.js'

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
    let json = Object.assign({}, this.#model.representation, {
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
      // TODO: Validate
      this.functions = Object.assign({}, this.#functions, cfg.functions)
      delete cfg.functions
    }

    if (cfg.hasOwnProperty('modules')) {
      // TODO: Validate
      this.#modules.custom = cfg.modules
      delete cfg.modules
    }

    let defaults = Object.assign({}, Defaults)
    delete defaults.breakpoints

    this.#model.once('load', () => {
      this.#model.once('load', () => {
        if (!this.#model.valid) {
          let attrs = this.#model.invalidDataAttributes

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

  storeApplication (viewportName, application, cb) {
    let viewport = this.#viewports.find({ name: viewportName })[0]

    if (!viewport) {
      return cb(ErrorUtils.createError({
        message: `DEVELOPER ERROR: Viewport "${viewportName}" not found`
      }))
    }

    viewport.applications.add(application)
    cb()
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
    this.#processObjects(cfg, cb, 'layout', 'typography')

    cfg.viewports = this.#generateViewports(cfg.hasOwnProperty('breakpoints') ? cfg.breakpoints : Defaults.breakpoints, 0, cb)
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

    let breakpoints = []
    let viewports = []

    cfg.forEach((entry, index) => {
      let type = NGN.typeof(entry)

      if (index > 0 && NGN.typeof(cfg[index - 1]) === type) {
        return reject(ErrorUtils.createError({
          message: `Invalid breakpoint configuration. Entries must alternate between type number and type object`
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

    let final = []

    breakpoints.forEach((breakpoint, index) => {
      let set = []
      let viewport = Object.assign({}, viewports[index])
      let next = viewports[index + 1]

      if (!viewport.hasOwnProperty('bounds')) {
        viewport.bounds = {}
      }

      viewport.bounds.min = breakpoint

      if (next) {
        viewport.bounds.max = breakpoints[index + 1] - 1
      }

      if (viewport.hasOwnProperty('breakpoints')) {
        viewport.type = 'group'

        set.push(...this.#generateViewports(viewport.breakpoints, min, reject).map(viewport => {viewports[index + 1]
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
}
