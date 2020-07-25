import parseValue from 'postcss-value-parser'
import ErrorUtils from '../utilities/ErrorUtils.js'

// const ArgModel = new NGN.DATA.Model({
//   autoid: false,
//
//   fields: {
//     name: String,
//     types: Array,
//     reserved: String,
//
//     required: {
//       type: Boolean,
//       default: false
//     },
//
//     chainable: {
//       type: Boolean,
//       default: false
//     },
//
//     delimiter: String
//   }
// })

// class Node {
//   #type = null
//   #value = null
//   #index = null
//
//   constructor (cfg, offset) {
//     this.#type = cfg.type
//     this.#value = cfg.value
//     this.#index = cfg.sourceIndex + NGN.coalesce(offset, 0)
//   }
//
//   get index () {
//     return this.#index
//   }
//
//   get type () {
//     return this.#type
//   }
//
//   get value () {
//     return this.#value
//   }
//
//   toString () {
//     switch (this.type) {
//       case 'word': return this.value
//       case 'string': return `"${this.value}"`
//       case 'function': return `(${this.nodes.map(node => {
//         return [',', ':'].some(char => node.value === char) ? `${node.value} ` : node.value
//       }).join('')})`
//     }
//   }
// }

// class Arg extends Node {
//   #name = null
//
//   constructor (name, cfg, offset) {
//     super(cfg, offset)
//     this.#name = name
//     this.nodes = NGN.coalesce(cfg.nodes, []).map(node => new Node(node, offset))
//   }
//
//   get name () {
//     return this.#name
//   }
// }

export default class AtRule {
  #params
  #name
  #root

  constructor (atrule) {
    this.#root = atrule
    this.#params = atrule.params
    this.#name = atrule.name
  }

  get params () {
    return parseValue(this.#params.replace(/\s+/g,' ').trim()).nodes.filter(arg => {
      return ['string', 'word', 'function'].includes(arg.type)
    })
  }

  get name () {
    return this.#name
  }

  get root () {
    return this.#root
  }

  error () {
    return this.#root.error(...arguments)
  }

  replaceWith () {
    this.#root.replaceWith(...arguments)
  }

  remove () {
    this.#root.remove()
  }

  toString () {
    return this.#root.toString()
  }
}

// export default class AtRule {
//   #cfg = null
//   #offset = 0
//   #args
//   #chainable = false
//   #formatError = null
//
//   constructor (cfg) {
//     this.#cfg = cfg
//
//     if (!cfg.root) {
//       throw ErrorUtils.createError({
//         message: [
//           'DEVELOPER ERROR. No atrule root provided in configuration. Config should be an object of shape:',
//           `\n${JSON.stringify({
//             root: 'Object<atrule>',
//             format: 'String',
//             args: 'Array'
//           }, null, 2)}`
//         ]
//       })
//     }
//
//     this.name = this.root.name
//     this.parent = NGN.coalesce(this.root.parent)
//     this.nodes = NGN.coalesce(this.root.nodes, [])
//
//     this.#offset = this.name.length + 2
//     this.#formatError = `Expected format: @${this.name} ${this.#cfg.format}`
//
//     if (!this.#cfg.hasOwnProperty('args')) {
//       return
//     }
//
//     if (NGN.typeof(this.#cfg.args) !== 'array') {
//       throw ErrorUtils.createError({
//         message: [
//           `DEVELOPER ERROR. Invalid ${this.name} argument configuration. Args config must be an array of ojects of shape:`,
//           `\n${JSON.stringify({
//             name: 'String',
//             types: 'Array<string|word|function|space>',
//             reserved: 'String',
//             required: 'Boolean (default: false)',
//             chainable: 'Boolean (default: false)',
//             delimiter: 'String'
//           }, null, 2)}`
//         ]
//       })
//     }
//
//     let params = parseValue(this.root.params.replace(/\s+/g,' ').trim()).nodes.filter(arg => {
//       return ['string', 'word', 'function'].includes(arg.type)
//     })
//
//     this.#args = this.#cfg.args.reduce((args, arg, i) => {
//       if (this.#chainable && this.#cfg.args.length > i + 1) {
//         throw ErrorUtils.createError({
//           message: [`DEVELOPER ERROR. Invalid ${this.name} argument configuration. Chainable args must be last in the list (There can only be one chainable arg)`]
//         })
//       }
//
//       let spec = new ArgModel(arg)
//       let input = params[i]
//
//       if (!input) {
//         if (spec.required) {
//           throw this.root.error(`\nMissing required argument "${spec.name}". \n${this.#formatError}`, {
//             index: this.#offset
//           })
//         }
//
//         return args
//       }
//
//       let processed = this.#processArg(params, spec, input, i)
//
//       if (processed) {
//         args[spec.name] = processed
//       }
//
//       return args
//     }, {})
//   }
//
//   #validateInput = (spec, input, index) => {
//     let err = {
//       arg: (name, index) => `Arg ${index}${name ? ` (${name})` : ''}`
//     }
//
//     if (!!spec.reserved && input.value !== spec.reserved) {
//       throw this.error(`\n${err.arg(spec.name, index)}: Expected "${spec.reserved}" but received "${input.value}" \n${this.#formatError}`, {
//         index: input.sourceIndex
//       })
//     }
//
//     if (!spec.types.includes(input.type)) {
//       throw this.error(`\n${err.arg(spec.name, index)} must be of one of the following types: ${spec.types.join(', ')} \n${this.#formatError}`, {
//         index: input.sourceIndex
//       })
//     }
//   }
//
//   #processArg = (params, spec, input, index) => {
//     this.#validateInput(spec, input, index)
//
//     let chained = null
//
//     if (index !== null && spec.chainable) {
//       this.#chainable = true
//       chained = params.slice(index)
//     }
//
//     if (chained) {
//       return chained.filter((arg, i) => {
//         return !(spec.delimiter && arg.value.trim() === spec.delimiter.trim())
//       }).map((arg, i) => {
//         this.#validateInput(spec, arg, index + (i + 1))
//         return new Arg(spec.name, arg, this.#offset)
//       })
//     }
//
//     return new Arg(spec.name, input, this.#offset)
//   }
//
//   get args () {
//     return this.#args
//   }
//
//   get raw () {
//     return this.root.toString()
//   }
//
//   get root () {
//     return this.#cfg.root
//   }
//
//   append (node) {
//     this.root.append(node)
//   }
//
//   error (message, cfg = {}) {
//     if (cfg.hasOwnProperty('index')) {
//       cfg.index += this.#offset
//     }
//
//     return this.root.error(message, cfg)
//   }
//
//   prepend (node) {
//     this.root.prepend(node)
//   }
//
//   remove () {
//     this.root.remove()
//   }
//
//   replaceWith (root) {
//     this.root.replaceWith(root)
//   }
// }
