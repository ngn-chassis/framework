import AtRule from '../AtRule.js'

export default class TypeRule extends AtRule {
  #size = null
  #relative = false

  constructor (atrule) {
    super(atrule)

    atrule.walkDecls(({ prop, value }) => {
      switch (prop) {
        case 'size':
          this.#size = parseFloat(value)
          break

        case 'relative':
          this.#relative = value
          break

        default: return // TODO: Throw Error
      }
    })
  }

  get size () {
    return this.#size
  }

  get relative () {
    return this.#relative
  }
}
