import Margin from '../margin/Margin.js'
import Padding from '../padding/Padding.js'
import Typeset from '../type/Typeset.js'

export default class Setting {
  #source

  constructor (setRule) {
    this.#source = setRule
  }

  get bounds () {
    return this.#source.bounds
  }

  get margin () {
    const { margin } = this.#source
    return margin ? new Margin(margin) : null
  }

  get selector () {
    return this.#source.selector
  }

  get padding () {
    const { padding } = this.#source
    return padding ? new Padding(padding) : null
  }

  get typeset () {
    const { typeset } = this.#source
    return typeset ? new Typeset(typeset) : null
  }
}
