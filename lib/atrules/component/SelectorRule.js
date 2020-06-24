import SelectorUtils from '../../utilities/SelectorUtils.js'

export default class SelectorRule {
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
