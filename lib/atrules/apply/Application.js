export default class Application {
  #source

  constructor (applyRule) {
    this.#source = applyRule
  }

  get typeset () {
    return this.#source.typeset
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
