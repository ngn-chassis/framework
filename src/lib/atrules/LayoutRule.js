import AtRule from './AtRule.js'

export default class LayoutRule extends AtRule {
  #properties = {
    display: 'inline-block',
    x: false,
    y: false,
    top: false,
    right: false,
    bottom: false,
    left: false,
    typeset: null,
    relative: false
  }

  constructor (atrule) {
    super(atrule)

    atrule.walkDecls(({ prop, value }) => {
      this.#properties[prop] = value
    })
  }

  get display () {
    return this.#properties.display
  }

  get x () {
    return this.#properties.x
  }

  get y () {
    return this.#properties.y
  }

  get top () {
    return this.#properties.top
  }

  get right () {
    return this.#properties.right
  }

  get bottom () {
    return this.#properties.bottom
  }

  get left () {
    return this.#properties.left
  }

  get relative () {
    return this.#properties.relative
  }

  get typeset () {
    return this.#properties.typeset
  }
}
