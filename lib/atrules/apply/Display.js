export default class Display {
  #x = false
  #y = false

  constructor (atrule) {
    this.display = atrule.display
    this.#x = atrule.x
    this.#y = atrule.y
    this.top = atrule.top
    this.right = atrule.right
    this.bottom = atrule.bottom
    this.left = atrule.left
    this.typeset = atrule.typeset

    if (!!atrule.display && ['x', 'y', 'top', 'right', 'bottom', 'left'].every(attr => !atrule[attr])) {
      this.#x = true
      this.#y = true
    }

    if (this.#y) {
      this.top = true
      this.bottom = true
    }

    if (this.#x) {
      this.right = true
      this.left = true
    }
  }
}
