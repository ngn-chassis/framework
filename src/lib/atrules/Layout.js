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

  constructor (atrule) {
    Array.isArray(atrule) ? this.#processShorthand(...atrule) : this.#processLonghand(atrule)

    if (['x', 'y', 'top', 'right', 'bottom', 'left'].every(attr => !atrule[attr])) {
      this.#properties.x = true
      this.#properties.y = true
    }

    if (this.#properties.y) {
      this.#properties.top = true
      this.#properties.bottom = true
    }

    if (this.#properties.x) {
      this.#properties.right = true
      this.#properties.left = true
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

  #processLonghand = atrule => {
    Object.keys(this.#properties).forEach(property => {
      switch (property) {
        case 'display':
          this.#properties.display = atrule.display
          break

        case 'type':
          this.#properties.typeset = parseFloat(atrule.typeset ?? 0)
          break

        default:
          this.#properties[property] = atrule[property] === 'true'
          break
      }
    })
  }

  #processShorthand = (...args) => args.forEach(arg => {
    const int = parseFloat(arg)

    if (!isNaN(int)) {
      this.#properties.typeset = int
      return
    }

    switch (arg) {
      case 'x':
      case 'y':
      case 'top':
      case 'right':
      case 'bottom':
      case 'left':
        this.#properties[arg] = true
        break

      case 'block':
      case 'inline-block':
      case 'inline':
        this.#properties.display = arg
        break

      case 'relative':
        this.#properties.relative = true
        break
    }
  })
}
