import Class from '../Class.js'
import StateRule from '../state/StateRule.js'

export default class Theme extends Class {
  #source
  #components
  #headings
  #properties

  constructor (themeRule) {
    super(themeRule)
    this.#source = themeRule

    this.#components = this.#source.components?.nodes.reduce((components, node) => {
      if (node.type !== 'rule') {
        // TODO: Throw error unless comment
        return components
      }

      const states = []
      const nodes = node.nodes.filter(node => {
        if (node.type === 'atrule' && node.name === 'state') {
          states.push(new StateRule(node))
          return false
        }

        return true
      })

      components[node.selector.trim()] = { nodes, states }
      return components
    }, {}) ?? {}

    this.#headings = this.#source.headings?.nodes.reduce((headings, node) => {
      if (node.type !== 'rule') {
        // TODO: Throw error unless comment
        return headings
      }

      const { selector, nodes } = node

      if (selector.includes(',')) {
        selector.split(',').forEach(part => this.#updateHeadingConfig(headings, part, nodes))
      } else {
        this.#updateHeadingConfig(headings, selector, nodes)
      }

      return headings
    }, {}) ?? {}

    this.#properties = this.#source.properties?.nodes.reduce((properties, node) => {
      if (node.type !== 'decl') {
        // TODO: Throw error unless comment
        return properties
      }

      properties[node.prop.replace('--', '')] = node.value
      return properties
    }, {}) ?? {}
  }

  get components () {
    return this.#components
  }

  get headings () {
    return this.#headings
  }

  get properties () {
    return this.#properties
  }

  getHeading (name) {
    return this.#headings[name]
  }

  toJson () {
    return this.toJSON()
  }

  toJSON () {
    return {
      properties: this.#properties,
      headings: this.#headings,
      components: this.#components
    }
  }

  toString () {
    return this.#source.toString()
  }

  #updateHeadingConfig = (headings, selector, nodes) => {
    selector = selector.trim()
    nodes = nodes.map(node => node.clone())

    if (Reflect.has(headings, selector)) {
      return headings[selector].push(nodes)
    }

    headings[selector] = nodes
  }
}
