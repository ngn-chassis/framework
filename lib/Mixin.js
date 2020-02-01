const parseValue = require('postcss-value-parser')
const Mixins = require('./Mixins.js')

const ConsoleUtils = require('./utilities/ConsoleUtils.js')
const ErrorUtils = require('./utilities/ErrorUtils.js')

class Node {
  constructor (cfg) {
    this.type = cfg.type
    this.value = cfg.value

    this.source = {
      column: cfg.sourceIndex
    }
  }
}

class Arg extends Node {
  constructor (cfg) {
    super(cfg)
    this.nodes = NGN.coalesce(cfg.nodes, []).map(node => new Node(node))
  }
}

module.exports = class Mixin {
  constructor (atRule) {
    this.atRule = atRule

    this.source = {
      line: atRule.source.start.line,
      column: atRule.source.start.column,
      file: atRule.source.input.file
    }

    let parser = parseValue(atRule.params)
    let firstArg = parser.nodes[0]

    if (firstArg.type !== 'word') {
      throw ErrorUtils.createError(Object.assign({}, this.source, {
        message: `Invalid mixin "${firstArg.value}"`
      }))
    }

    this.name = firstArg.value

    this.args = parser.nodes
      .slice(1)
      .filter(node => !['comment', 'space'].includes(node.type))
      .map(node => new Arg(node))
  }

  process (cb) {
    Mixins[this.name](this, (err, output) => {
      if (err) {
        throw ErrorUtils.createError(Object.assign({}, this.source, {
          mixin: this.name,
          message: err
        }))
      }

      cb(output)
    })
  }

  resolve () {
    if (!Mixins.hasOwnProperty(this.name)) {
      throw ErrorUtils.createError(Object.assign({}, this.source, {
        message: `Invalid mixin "${this.name}"`
      }))
    }

    this.process(output => this.atRule.replaceWith(output))
  }
}
