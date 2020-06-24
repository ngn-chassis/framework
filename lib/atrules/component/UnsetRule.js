export default class UnsetRule {
  #root = null
  #unset = null

  constructor (atrule) {
    this.#root = atrule
    this.#unset = atrule.params.trim()
  }

  toString () {
    return this.#unset
  }
}
