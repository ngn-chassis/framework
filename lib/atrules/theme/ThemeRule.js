import ClassRule from '../ClassRule.js'

export default class ThemeRule extends ClassRule {
  #validProperties = ['properties', 'headings', 'components']

  #validHeadings = ['all', 1,2,3,4,5,6, 'legend'].map(type => {
    return typeof type === 'number' ? `h${type}` : type
  })

  #properties = []
  #components = []

  #headings = this.#validHeadings.map(name => ({
    name,
    nodes: []
  }))

  constructor (atrule) {
    super({
      root: atrule,
      format: 'name {...config}',

      args: [
        {
          name: 'name',
          required: true,
          types: ['word']
        },

        {
          types: ['space']
        }
      ]
    })

    if (!this.root.nodes || this.root.nodes.length === 0) {
      throw this.error(`\nInvalid theme configuration\nTheme "${this.name}" has no configuration`)
    }

    this.root.nodes.forEach(node => {
      if (node.type !== 'atrule') {
        throw node.error(`\nInvalid node type "${node.type}"`)
      }

      switch (node.name) {
        case 'properties': return this.#validateProperties(node.nodes)
        case 'headings': return this.#validateHeadings(node.nodes)
        case 'components': return this.#validateComponents(node.nodes)
        default: throw node.error(`\nInvalid configuration property "${node.selector}"\nValid properties include: ${this.#validProperties.join(', ')}`)
      }
    })
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

  #validateHeadings = nodes => {
    let all = []
    let headings = []

    nodes.forEach(node => {
      if (node.type !== 'rule') {
        throw node.error(`\nInvalid heading theme configuration property type "${node.type}"\nHeading config properties must rules with one of the following selectors: ${this.#validHeadings.join(', ')}`)
      }

      let heading = this.#headings.find(heading => heading.name === node.selector)

      if (!heading) {
        throw node.error(`\nInvalid heading theme configuration property "${node.selector}"\nValid properties include: ${this.#validHeadings.join(', ')}`)
      }

      heading.nodes = node.nodes
    })
  }

  #validateComponents = nodes => {
    nodes.forEach(node => {
      if (node.type !== 'rule') {
        throw node.error(`\nInvalid component theme configuration property type "${node.type}"`)
      }

      let config = {
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
