import SelectorUtils from '../utilities/SelectorUtils.js'

export default class Selector {
  #root = null
  #selector = null

  constructor (parent, atrule, nested = false) {
    this.#root = atrule
    this.#selector = atrule.params
    this.parent = parent
    this.isNested = nested
  }

  toString () {
    return this.#selector
  }

  validate (cb) {
    let list = SelectorUtils.clean(this.#selector, true)

    if (!this.isNested) {
      return cb()
    }

    let invalid = list.filter(selector => !selector.startsWith('&'))

    if (invalid.length > 0) {
      return cb(this.#root.error(`\nSelector must include a nesting operator (&)`))
    }

    return cb()
  }
}
