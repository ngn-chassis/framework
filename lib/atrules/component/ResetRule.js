export default class ResetRule {
  #root = null
  #reset = null

  constructor (atrule) {
    this.#root = atrule
    this.#reset = atrule.params.trim()
  }

  toString () {
    return this.#reset
  }
}
