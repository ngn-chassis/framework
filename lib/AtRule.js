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

  get isValid () {
    return AtRules.hasOwnProperty(this.name)
  }

  process (cb) {
    AtRules[this.name](this, (err, output) => {
      if (err) {
        cb(ErrorUtils.createError(Object.assign({}, this.source, {
          atRule: this.name,
          message: err
        })))
      }

      cb(null, output)
    })
  }

  resolve (cb) {
    this.process((err, output) => {
      if (err) {
        return cb(err)
      }

      this.root.replaceWith(output)
      cb()
    })
  }
}
