import CSSUtils from './utilities/CSSUtils.js'
import SelectorUtils from './utilities/SelectorUtils.js'

export default class Typeset {
  #root = null
  selector = null
  bounds = null

  constructor (atrule) {
    this.#root = atrule
    this.increment = parseFloat(atrule.increment)
  }

  validate (cb) {
    this.#getSelector((err, selector, mediaQuery) => {
      this.selector = selector

      if (mediaQuery) {
        this.bounds = mediaQuery.width
      }

      cb()
    })
  }

  #getSelector = cb => {
    let { parent } = this.#root

    if (!parent || parent.type === 'root' ) {
      return cb(this.#root.error(`\n@typeset rule cannot be used at the root level`))
    }

    let chain = SelectorUtils.getLineage(parent)

    SelectorUtils.resolve(chain, (err, result, mediaQuery) => {
      if (err) {
        return cb(err)
      }

      cb(null, result, mediaQuery)
    })
  }
}
