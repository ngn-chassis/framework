export default class Class {
  #source
  #parent
  #extensions = []

  constructor (source, parent) {
    this.#source = source
    this.#parent = NGN.coalesce(parent)
  }

  get nodes () {
    return this.#source.nodes
  }

  get extensions () {
    return this.#extensions
  }

  get hasExtensions () {
    return this.#extensions.length > 0
  }

  get isExtension () {
    return !!this.#source.superclass
  }

  get lineage () {
    return [...(this.parent?.lineage ?? []), this.parent].filter(Boolean)
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
