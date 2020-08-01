import nesting from 'postcss-nesting'

import State from '../state/State.js'
import CSSUtils from '../../utilities/CSSUtils.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

export default class Component extends State {
  #source
  #states

  constructor (source, parent) {
    super(...arguments)
    this.#source = source

    this.#states = this.#source.states.map(stateRule => {
      return new State(stateRule, !!parent ? parent.getState(stateRule.name) : null)
    })
  }

  get not () {
    return this.#source.not
  }

  get reset () {
    return this.#source.reset
  }

  get selector () {
    let parts = SelectorUtils.parse(this.#source.selector)

    if (parts.nested.length > 0) {
      let rule = CSSUtils.createRule(this.parent.selector)
      rule.nodes.push(CSSUtils.createRule(parts.nested.join(', ')))
      return [nesting.process(rule, { from: void 0 }).root.nodes[0].selector, ...parts.standalone].join(', ')
    }

    return parts.standalone.join(', ')
  }

  get states () {
    return this.#states
  }

  get unset () {
    return this.#source.unset
  }
}
