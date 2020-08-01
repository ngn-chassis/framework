import AtRule from '../AtRule.js'
import MarginRule from '../margin/MarginRule.js'
import PaddingRule from '../padding/PaddingRule.js'
import TypeRule from '../type/TypeRule.js'
import MediaQueryRule from '../media/MediaQueryRule.js'

import SelectorUtils from '../../utilities/SelectorUtils.js'

export default class SetRule extends AtRule {
  #bounds
  #parent
  #typeRule
  #marginRule
  #paddingRule
  #isShorthand
  #source

  constructor (setRule) {
    super(setRule)
    this.#source = setRule
    this.#isShorthand = !(setRule.nodes?.length > 0)
    this.#parent = this.#getParent()

    setRule.walkAtRules(atrule => {
      switch (atrule.name) {
        case 'type':
          this.#typeRule = new TypeRule(atrule)
          break

        case 'margin':
          this.#marginRule = new MarginRule(atrule)
          break

        case 'padding':
          this.#paddingRule = new PaddingRule(atrule)
          break
      }
    })

    this.#bounds = this.#getBounds()
  }

  get bounds () {
    return this.#bounds
  }

  get isShorthand () {
    return this.#isShorthand
  }

  get margin () {
    if (this.#isShorthand && this.params[0]?.value === 'margin') {
      return this.params.slice(1).map(param => param.value)
    }

    return this.#marginRule ?? null
  }

  get padding () {
    if (this.#isShorthand && this.params[0]?.value === 'padding') {
      return this.params.slice(1).map(param => param.value)
    }

    return this.#paddingRule ?? null
  }

  get selector () {
    return this.#parent.selector
  }

  get typeset () {
    if (this.#isShorthand) {
      return this.params[0]?.value === 'type'
        ? {
          size: parseFloat(this.params[1]?.value ?? 0),
          relative: this.params[2]?.value === 'relative'
        }
        : null
    }

    return this.#typeRule ?? null
  }

  #getBounds = () => {
    let { parent } = this.#source

    if (parent.type === 'rule') {
      parent = parent.parent
    }

    if (parent.type === 'atrule' && parent.name === 'media') {
      let query = new MediaQueryRule(parent)
      let { min, max } = query.width
      return (!!min || !!max) ? query.width : null
    }

    return null
  }

  #getParent = () => {
    return SelectorUtils.getLineage(this.#source.parent).filter(node => node.type === 'rule')[0]
  }
}
