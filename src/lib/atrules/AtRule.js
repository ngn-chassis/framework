import parseValue from 'postcss-value-parser'

export default class AtRule {
  #params
  #name
  #root

  constructor (atrule) {
    this.#root = atrule
    this.#params = atrule.params
    this.#name = atrule.name
  }

  get params () {
    return parseValue(this.#params.replace(/\s+/g, ' ').trim()).nodes.filter(arg => {
      return ['string', 'word', 'function'].includes(arg.type)
    })
  }

  get name () {
    return this.#name
  }

  get root () {
    return this.#root
  }

  error () {
    return this.#root.error(...arguments)
  }

  replaceWith () {
    this.#root.replaceWith(...arguments)
  }

  remove () {
    this.#root.remove()
  }

  toString () {
    return this.#root.toString()
  }
}
