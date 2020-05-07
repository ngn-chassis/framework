import parseValue from 'postcss-value-parser'
import ErrorUtils from '../utilities/ErrorUtils.js'

const ArgModel = new NGN.DATA.Model({
  autoid: false,

  fields: {
    name: String,
    types: Array,
    reserved: String,
    required: {
      type: Boolean,
      default: false
    }
  }
})

class Node {
  constructor (cfg, offset) {
    this.type = cfg.type
    this.value = cfg.value
    this.index = cfg.sourceIndex + NGN.coalesce(offset, 0)
  }

  toString () {
    switch (this.type) {
      case 'word': return this.value
      case 'string': return `"${this.value}"`
      case 'function': return `(${this.nodes.map(node => {
        return [',', ':'].some(char => node.value === char) ? `${node.value} ` : node.value
      }).join('')})`
    }
  }
}

class Arg extends Node {
  constructor (cfg, offset) {
    super(cfg, offset)
    this.nodes = NGN.coalesce(cfg.nodes, []).map(node => new Node(node, offset))
  }
}

export default class AtRule {
  #cfg = null
  #offset = 0

  constructor (cfg) {
    this.#cfg = cfg
    this.root = NGN.coalesce(this.#cfg.root)

    if (!this.root) {
      throw ErrorUtils.createError({
        message: [
          'DEVELOPER ERROR. No atrule root provided in configuration. Config should be an object of shape:',
          `\n${JSON.stringify({
            root: 'Object<atrule>',
            format: 'String',
            args: 'Array'
          }, null, 2)}`
        ]
      })
    }

    this.name = this.root.name
    this.parent = NGN.coalesce(this.root.parent)
    this.nodes = NGN.coalesce(this.root.nodes, [])

    if (!this.#cfg.hasOwnProperty('args')) {
      return
    }

    let { args } = this.#cfg

    if (NGN.typeof(args) !== 'array') {
      throw ErrorUtils.createError({
        message: [
          `DEVELOPER ERROR. Invalid ${this.name} argument configuration. Args config must be an array of ojects of shape:`,
          `\n${JSON.stringify({
            name: 'String',
            types: 'Array<string|word|function|space>',
            reserved: 'String',
            required: 'Boolean'
          }, null, 2)}`
        ]
      })
    }

    this.args = {}
    let cleaned = this.root.params.replace(/\s+/g,' ').trim()
    let parsed = parseValue(cleaned).nodes
    this.#offset = this.name.length + 2

    let required = this.#cfg.args.filter(arg => arg.required)

    let err = {
      format: `Exepected format: @${this.name} ${this.#cfg.format}`,
      arg: (name, index) => `Arg ${index}${name ? ` (${name})` : ''}`
    }

    required.forEach(arg => {
      let input = parsed[this.#cfg.args.indexOf(arg)]

      if (!input) {
        throw this.root.error(`\nMissing required argument "${arg.name}". \n${err.format}`, {
          index: this.#offset
        })
      }
    })

    parsed.forEach((arg, i) => {
      let spec = args[i]

      if (!spec) {
        throw this.error(`\nToo many arguments. \n${err.format}`, {
          index: parsed[parsed.length - 1].sourceIndex
        })
      }

      spec = new ArgModel(spec)
      let { name, types, reserved, required } = spec

      if (reserved && arg.value !== reserved) {
        throw this.error(`\n${err.arg(name, i)}: Expected "${reserved}" but received "${arg.value}" \n${err.format}`, {
          index: arg.sourceIndex
        })
      }

      if (!types.includes(arg.type)) {
        throw this.error(`\n${err.arg(name, i)} must be of one of the following types: ${types.join(', ')} \n${err.format}`, {
          index: arg.sourceIndex
        })
      }

      if (['comment', 'space'].includes(arg.type)) {
        return
      }

      this.args[name] = new Arg(arg, this.#offset)
    })
  }

  get params () {
    return this.root.params
  }

  get raw () {
    return this.root.toString()
  }

  error (message, cfg = {}) {
    if (cfg.hasOwnProperty('index')) {
      cfg.index += this.#offset
    }

    return this.root.error(message, cfg)
  }

  remove () {
    this.root.remove()
  }

  replaceWith (root) {
    this.root.replaceWith(root)
  }
}
