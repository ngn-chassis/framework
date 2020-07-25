export default class Class {
  #source
  #parent
  #extensions = []

  constructor (source, parent) {
    this.#source = source
    this.#parent = NGN.coalesce(parent)
  }

  get extensions () {
    return this.#extensions
  }

  get hasExtensions () {
    return this.#extensions.length > 0
  }

  get name () {
    return this.#source.name
  }

  get parent () {
    return this.#parent
  }

  addExtension (component) {
    this.#extensions.push(component)
  }
}
