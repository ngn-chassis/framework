import parseValue from 'postcss-value-parser'
import AtRules from './AtRules.js'
import ErrorUtils from './utilities/ErrorUtils.js'

class Node {
  constructor (cfg) {
    this.type = cfg.type
    this.value = cfg.value

    this.source = {
      column: cfg.sourceIndex
    }
  }

  toString () {
    switch (this.type) {
      case 'word': return this.value
      case 'string': return `"${this.value}"`
      case 'function': return `(${this.nodes.map(node => node.value).join(', ')})`
    }
  }
}

class Arg extends Node {
  constructor (cfg) {
    super(cfg)
    this.nodes = NGN.coalesce(cfg.nodes, []).map(node => new Node(node))
  }
}

export default class AtRule {
  constructor (atRule) {
    this.root = atRule
    this.name = atRule.name
    this.params = atRule.params
    this.nodes = NGN.coalesce(atRule.nodes, [])

    this.source = {
      line: atRule.source.start.line,
      column: atRule.source.start.column,
      file: atRule.source.input.file
    }

    let parser = parseValue(atRule.params)

    this.args = parser.nodes
      .filter(node => !['comment', 'space'].includes(node.type))
      .map(node => new Arg(node))
  }

  resolve (cb) {
    AtRules[this.name](this, (err, output, render = true) => {
      if (err) {
        return cb(ErrorUtils.createError(Object.assign({}, this.source, {
          css: `@${this.name} ${this.params}`,
          message: err
        })))
      }

      if (!render) {
        return cb()
      }

      this.root.replaceWith(output)
      cb()
    })
  }
}
