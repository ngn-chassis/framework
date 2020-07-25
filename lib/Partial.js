import Stylesheet from './Stylesheet.js'

export default class Partial extends Stylesheet {
  #parent

  constructor (filepath, parent) {
    super(filepath)
    this.#parent = parent
  }

  get parent () {
    return this.#parent
  }
}
