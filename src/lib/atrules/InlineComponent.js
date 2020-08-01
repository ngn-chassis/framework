import Component from './component/Component.js'
import CSSUtils from '../utilities/CSSUtils.js'

export default class InlineComponent extends Component {
  #name
  #parent
  #selector
  #source
  #states

  constructor (inlineComponentRule, parent) {
    super(...arguments)
    this.#source = inlineComponentRule
    this.#parent = parent
    this.#name = `${inlineComponentRule.type}-component_${NGN.DATA.util.GUID()}`
  }

  get isExtension () {
    return this.#source.type === 'extension'
  }

  get parent () {
    return this.#parent
  }

  get name () {
    return this.#name
  }

  get selector () {
    return this.#source.selector
  }

  get superclass () {
    return this.#source.superclass
  }

  get type () {
    return this.#source.type
  }

  resolve () {
    const rule = CSSUtils.createRule(this.#name)

    if (!this.isExtension) {
      rule.append(this.parent.nodes)
    }

    rule.append(this.nodes)

    this.states.forEach(state => {
      const stateRule = CSSUtils.createRule(state.selector)

      if (!this.isExtension) {
        stateRule.append(state.parent.nodes)
      }

      stateRule.append(state.nodes)
      rule.append(stateRule)
    })

    return rule.nodes
  }
}
