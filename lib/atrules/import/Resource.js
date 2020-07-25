export default class Resource {
  #root = null
  #name = null

  constructor (imp) {
    this.#root = imp.root
  }

  error (message, cfg) {
    return this.#root.error(message, cfg)
  }

  replaceWith (root) {
    this.#root.replaceWith(root)
  }
}
