import AtRule from '../AtRule.js'
import MarginRule from './MarginRule.js'
import Margin from './Margin.js'
import PaddingRule from './PaddingRule.js'
import Padding from './Padding.js'
import TypesetRule from './TypesetRule.js'
import Typeset from './Typeset.js'

import QueueUtils from '../../utilities/QueueUtils.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

export default class ApplyRule extends AtRule {
  #bounds = null
  #selector = null

  margin = null
  padding = null
  typeset = null

  constructor (atrule) {
    super({
      root: atrule,
      format: 'arg[ arg[ ...]]',

      args: [{
        name: 'mixin',
        types: ['word']
      }]
    })

    this.mixin = this.args.hasOwnProperty('mixin') ? this.args.mixin.value : null
    this.source = atrule.source
  }

  get bounds () {
    return this.#bounds
  }

  get selector () {
    return this.#selector
  }

  validate (cb) {
    if (!!this.mixin) {
      return cb(this.error(`\n@apply shorthand not yet implemented`))
    }

    this.#getSelector((err, selector, mediaQuery) => {
      if (err) {
        return cb(err)
      }

      this.#selector = selector

      if (mediaQuery) {
        this.#bounds = mediaQuery.width
      }

      QueueUtils.run({
        log: false,

        tasks: this.nodes.map(node => ({
          name: `Processing Node`,
          callback: next => this.#registerNode(node, next, cb)
        }))
      })
      .then(cb)
      .catch(cb)
    })
  }

  #getSelector = cb => {
    let { parent } = this.root

    if (!parent || parent.type === 'root' ) {
      return cb(this.root.error(`\n@typeset rule cannot be used at the root level`))
    }

    let chain = SelectorUtils.getLineage(parent)

    SelectorUtils.resolve(chain, (err, result, mediaQuery) => {
      if (err) {
        return cb(err)
      }

      cb(null, result, mediaQuery)
    })
  }

  #registerNode = (node, resolve, reject) => {
    if (!['atrule', 'comment'].includes(node.type)) {
      return reject(node.error(`\nInvalid @apply configuration`))
    }

    if (node.type === 'comment') {
      return resolve()
    }

    this.#processRule(node, resolve, reject)
  }

  #processRule = (node, resolve, reject) => {
    if (!!this[node.name]) {
      return reject(rule.error(`\nDuplicate "${node.name}" property`))
    }

    let rule

    switch (node.name) {
      case 'typeset':
        rule = new TypesetRule(node)
        this[node.name] = new Typeset(rule)
        break

      case 'margin':
        rule = new MarginRule(node)
        this[node.name] = new Margin(rule)
        break

      case 'padding':
        rule = new PaddingRule(node)
        this[node.name] = new Padding(rule)
        break

      default: return reject(node.error(`\nInvalid @apply configuration property "@${node.name}"`))
    }

    resolve()
  }
}
