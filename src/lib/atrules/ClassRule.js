import AtRule from './AtRule.js'

export default class ClassRule extends AtRule {
  #properties = []
  #nodes = []

  constructor (atrule, properties = []) {
    super(atrule)

    atrule.nodes.forEach(node => {
      switch (node.type) {
        case 'atrule': return properties.includes(node.name) ? this.#properties.push(node) : this.#nodes.push(node)
        case 'comment': return
        default: return this.#nodes.push(node)
      }
    })
  }

  get nodes () {
    return this.#nodes
  }

  get name () {
    return this.params[0]?.value ?? null
  }

  get superclass () {
    return this.params[2]?.value ?? null
  }

  getProperty (name) {
    const properties = this.#properties.filter(property => property.name === name)

    switch (properties.length) {
      case 0: return null
      case 1: return properties[0]
      default: return properties
    }
  }
}
