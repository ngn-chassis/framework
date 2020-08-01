import ComponentRule from './component/ComponentRule.js'
import SelectorUtils from '../utilities/SelectorUtils.js'

export default class InlineComponentRule extends ComponentRule {
  #selector
  #source

  constructor (atrule) {
    atrule.nodes = atrule.nodes || []
    super(atrule)
    this.#source = atrule
  }

  get parent () {
    return this.#source.parent
  }

  get selector () {
    return this.#selector
  }

  get superclass () {
    return this.params[0]?.value ?? null
  }

  get type () {
    return this.#source.name === 'extend'
      ? 'extension'
      : this.#source.name === 'new'
        ? 'new'
        : null
  }

  resolveSelector (cb) {
    SelectorUtils.resolve(SelectorUtils.getLineage(this.#source.parent), (err, selector, query) => {
      if (err) {
        return cb(err)
      }

      this.#selector = selector
      cb(null, selector, query)
    })
  }
}
