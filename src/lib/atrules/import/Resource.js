export default class Resource {
  #root
  #source

  constructor (imp) {
    this.#root = imp.root
    this.#source = imp
  }

  get source () {
    return this.#source
  }

  error (message, cfg) {
    return this.#root.error(message, cfg)
  }

  replaceWith (root) {
    this.#root.replaceWith(root)
  }
}
