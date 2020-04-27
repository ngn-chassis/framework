import ClassRule from '../ClassRule.js'

export default class ThemeRule extends ClassRule {
  #validProperties = ['properties', 'headings', 'components']

  #validHeadings = ['all', 1,2,3,4,5,6, 'legend'].map(type => {
    return typeof type === 'number' ? `h${type}` : type
  })

  properties = []
  components = []

  headings = this.#validHeadings.map(name => ({
    name,
    nodes: []
  }))

  constructor (atrule) {
    super({ type: 'theme', root: atrule })
  }

  validate (cb) {
    super.validate(err => {
      if (err) {
        return cb(err)
      }

      if (!this.root.nodes || this.root.nodes.length === 0) {
        return cb(this.error(`\nInvalid theme configuration\nTheme "${this.name}" has no nodes`))
      }

      this.root.nodes.forEach(node => {
        if (node.type !== 'rule') {
          return cb(node.error(`\nInvalid node type "${node.type}"`))
        }

        switch (node.selector) {
          case 'properties': return this.#validateProperties(node.nodes, cb)
          case 'headings': return this.#validateHeadings(node.nodes, cb)
          case 'components': return this.#validateComponents(node.nodes, cb)
          default: return cb(node.error(`\nInvalid configuration property "${node.selector}"\nValid properties include: ${this.#validProperties.join(', ')}`))
        }
      })

      cb()
    })
  }

  #validateProperties = (decls, cb) => {
    decls.forEach(decl => {
      let name = decl.prop

      if (name.substr(0, 2) !== '--') {
        return cb(decl.error(`\nInvalid CSS Custom Property. Custom Properties must be prefixed with "--"`))
      }

      this.properties.push({
        name: decl.prop,
        value: decl.value
      })
    })
  }

  #validateHeadings = (nodes, cb) => {
    let all = []
    let headings = []

    nodes.forEach(node => {
      if (node.type !== 'rule') {
        return cb(node.error(`\nInvalid heading theme configuration property type "${node.type}"\nHeading config properties must rules with one of the following selectors: ${this.#validHeadings.join(', ')}`))
      }

      let heading = this.headings.find(heading => heading.name === node.selector)

      if (!heading) {
        return cb(node.error(`\nInvalid heading theme configuration property "${node.selector}"\nValid properties include: ${this.#validHeadings.join(', ')}`))
      }

      heading.nodes = node.nodes
    })
  }

  #validateComponents = (nodes, cb) => {
    nodes.forEach(node => {
      if (node.type !== 'rule') {
        return cb(node.error(`\nInvalid component theme configuration property type "${node.type}"`))
      }

      let config = {
        name: node.selector,
        states: []
      }

      node.nodes.forEach(node => {
        if (node.type !== 'atrule') {
          return cb(node.error(`\nInvalid component theme configuration property type "${node.type}"\nComponent themes accept @state rules only`))
        }

        if (node.name !== 'state') {
          return cb(node.error(`\nInvalid component theme configuration property "@${node.name}"\nComponent themes accept @state rules only`))
        }

        config.states.push({
          name: node.params,
          nodes: node.nodes
        })
      })

      this.components.push(config)
    })
  }
}
