export default class Layout {
  #properties = {
    x: false,
    y: false,
    top: false,
    right: false,
    bottom: false,
    left: false,
    display: 'inline-block',
    typeset: 0,
    relative: false
  }

  constructor (properties) {
    this.#properties = properties
    let { x, y, top, right, bottom, left } = this.#properties

    if (y) {
      this.#properties = Object.assign(this.#properties, {
        top: true,
        bottom: true
      })
    }

    if (x) {
      this.#properties = Object.assign(this.#properties, {
        right: true,
        left: true
      })
    }

    if (top && bottom && !y) {
      this.#properties.y = true
    }

    if (left && right && !x) {
      this.#properties.x = true
    }
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

  get display () {
    return this.#properties.display
  }

  get typeset () {
    return this.#properties.typeset
  }

  get relative () {
    return this.#properties.relative
  }

  get properties () {
    return this.#properties
  }
}
