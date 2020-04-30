export default class Class {
  #cfg = null
  #root = null
  #extensions = []

  constructor (cfg) {
    this.#cfg = cfg
    this.#root = cfg.root
  }

  get extensions () {
    return this.#extensions
  }

  get isExtension () {
    return this.#cfg.isExtension
  }

  get hasExtensions () {
    return this.#extensions.length > 0
  }

  get name () {
    return this.#cfg.name
  }

  get superclass () {
    return this.#cfg.superclass
  }

  addExtension (component) {
    this.#extensions.push(component)
  }

  error (message, cfg) {
    return this.#root.error(message, cfg)
  }
}
