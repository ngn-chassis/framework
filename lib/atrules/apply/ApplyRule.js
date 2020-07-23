import AtRule from '../AtRule.js'
import DisplayRule from './DisplayRule.js'
import Display from './Display.js'
import TypesetRule from './TypesetRule.js'
import Typeset from './Typeset.js'

import CSSUtils from '../../utilities/CSSUtils.js'
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

  validate (components, cb) {
    if (!!this.mixin) {
      return cb(this.error(`\n@apply shorthand not yet implemented`))
    }

    this.#getSelector(components, (err, selector, mediaQuery) => {
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

  #getSelector = (components, cb) => {
    let { parent } = this.root

    if (!parent || parent.type === 'root' ) {
      return cb(this.root.error(`\n@typeset rule cannot be used at the root level`))
    }

    let chain = SelectorUtils.getLineage(parent).map(node => node.clone())
    let isComponentConfig = chain.some(ancestor => ancestor.type === 'atrule' && ['components', 'component'].some(name => ancestor.name === name))
    let isStateConfig = parent.type === 'atrule' && parent.name === 'state'

    let component
    let componentConfig

    if (isComponentConfig || isStateConfig) {
      componentConfig = chain.find(ancestor => ancestor.type === 'atrule' && ancestor.name === 'component')

      if (!componentConfig) {
        let componentsConfig = chain.find(ancestor => ancestor.type === 'atrule' && ancestor.name === 'components')
        componentConfig = chain[chain.indexOf(componentsConfig) + 1]
      }

      component = components[componentConfig.selector]

      if (isStateConfig) {
        let state = component.states.find(state => state.name === parent.params)
        let rule = CSSUtils.createRule(state.selector)
        rule.nodes = parent.nodes
        chain.splice(chain.indexOf(parent), 1, rule)
      } else if (component) {
        componentConfig.selector = component.selector
      }
    }

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
      case 'padding':
        rule = new DisplayRule(node)
        this[node.name] = new Display(rule)
        break

      default: return reject(node.error(`\nInvalid @apply configuration property "@${node.name}"`))
    }

    resolve()
  }
}
