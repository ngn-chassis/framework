import Margin from './Margin.js'
import Padding from './Padding.js'
import Typeset from './Typeset.js'

export default class Application {
  #source

  constructor (applyRule) {
    this.#source = applyRule
  }

  get margin () {
    let { margin } = this.#source

    if (!!margin) {
      return new Margin(margin)
    }

    return null
  }

  get padding () {
    let { padding } = this.#source

    if (!!padding) {
      return new Padding(padding)
    }

    return null
  }

  get typeset () {
    let { typeset } = this.#source

    if (!!typeset) {
      return new Typeset(typeset)
    }

    return null
  }
}

// export default class Application {
//   #root = null
//
//   constructor (atrule) {
//     this.#root = atrule
//     this.source = atrule.source
//     this.bounds = atrule.bounds
//     this.selector = atrule.selector
//     this.margin = atrule.margin
//     this.padding = atrule.padding
//     this.typeset = atrule.typeset
//   }
//
//   get root () {
//     return this.#root
//   }
//
//   replaceWith (nodes) {
//     this.#root.replaceWith(nodes)
//   }
// }
