export default class Typeset {
  sizeSet = false
  relative = false

  constructor (atrule) {
    this.size = parseFloat(atrule.size)
    this.relative = atrule.relative
  }
}
