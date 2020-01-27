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
  #atRule

  constructor (atRule) {
    this.#atRule = atRule

    let parser = parseValue(atRule.params)

    let firstArg = parser.nodes[0]

    if (firstArg.type !== 'word') {
      throw ErrorUtils.createError({
        message: `Invalid mixin "${firstArg.value}"`
      })
    }

    this.name = firstArg.value

    this.args = parser.nodes.slice(1).filter(node => {
      return !['comment', 'space'].some(type => node.type === type)
    }).map(node => new Arg(node))

    this.source = {
      line: atRule.source.start.line,
      column: atRule.source.start.column
    }
  }

  resolve () {
    Mixins.process(this, (err, output) => {
      if (err) {
        throw ErrorUtils.createError({
          line: this.source.line,
          mixin: this.name,
          message: err
        })
      }

      this.#atRule.replaceWith(output)
    })

    // let output = Mixins[this.name](this.source, this.args)
  }
}
