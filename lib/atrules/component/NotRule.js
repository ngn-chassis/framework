import SelectorUtils from '../../utilities/SelectorUtils.js'
import SelectorRule from './SelectorRule.js'

export default class NotRule extends SelectorRule {
  #root = null
  #selector = null

  constructor (atrule) {
    this.#root = atrule
    this.#selector = SelectorUtils.clean(atrule.params)
  }

  toString () {
    return this.#selector
  }
}
