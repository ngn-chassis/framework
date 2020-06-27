import ClassRule from '../ClassRule.js'
import HeadingStore from './HeadingStore.js'
import Components from '../../modules/components.js'

export default class ThemeRule extends ClassRule {
  #validProperties = ['properties', 'headings', 'components']

  #properties = []

  #components = []
  #headings = new HeadingStore()

  constructor (atrule) {
    super({
      root: atrule,
      format: 'name {...}',

      args: [
        {
          name: 'name',
          required: true,
          types: ['word']
        }
      ]
    })

    if (!this.root.nodes || this.root.nodes.length === 0) {
      throw this.error(`\nInvalid theme configuration\nTheme "${this.name}" has no configuration`)
    }

    this.root.nodes.forEach(node => {
      if (node.type === 'comment') {
        return
      }

      if (node.type !== 'atrule') {
        throw node.error(`\nInvalid node type "${node.type}"`)
      }

      switch (node.name) {
        case 'properties': return this.#validateProperties(node.nodes)
        case 'headings': return this.#headings.load(node.nodes)
        case 'components': return this.#validateComponents(node.nodes)
        default: throw node.error(`\nInvalid configuration property "${node.selector}"\nValid properties include: ${this.#validProperties.join(', ')}`)
      }
    })
  }

  get components () {
    return this.#components
  }

  get headings () {
    return this.#headings.data
  }

  get sharedHeadingStyles () {
    return this.#headings.sharedStyles
  }

  get properties () {
    return this.#properties
  }

  #validateProperties = decls => {
    decls.forEach(decl => {
      let name = decl.prop

      if (name.substr(0, 2) !== '--') {
        throw decl.error(`\nInvalid CSS Custom Property. Custom Properties must be prefixed with "--"`)
      }

      this.properties.push({
        prop: decl.prop,
        value: decl.value
      })
    })
  }

  #validateComponents = nodes => {
    nodes.forEach(node => {
      if (node.type !== 'rule') {
        throw node.error(`\nInvalid component theme configuration property type "${node.type}"`)
      }

      let config = {
        root: node,
        name: node.selector,
        states: [],
        styles: []
      }

      node.nodes.forEach(node => {
        switch (node.type) {
          case 'atrule': return config.states.push({
            name: node.params,
            nodes: node.nodes
          })

          default: return config.styles.push(node)
        }
      })

      this.components.push(config)
    })
  }
}
