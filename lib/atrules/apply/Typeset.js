export default class Typeset {
  #size = 0
  #relative = false

  constructor (atrule) {
    this.#size = parseFloat(atrule.size)
    this.#relative = atrule.relative
  }

  get size () {
    return this.#size ?? null
  }

  get relative () {
    return this.#relative ?? null
  }
}
