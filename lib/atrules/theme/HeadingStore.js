export default class HeadingStore {
  #validHeadings = [1,2,3,4,5,6, 'legend'].map(type => {
    return typeof type === 'number' ? `h${type}` : type
  })

  #headings = this.#validHeadings.map(name => ({
    name,
    nodes: []
  }))

  #all = []

  get data () {
    return this.#headings
  }

  get sharedStyles () {
    return this.#all
  }

  get (name) {
    return this.#headings.find(heading => heading.name === name)
  }

  has (name) {
    return this.#headings.some(heading => heading.name === name)
  }

  load (nodes) {
    nodes.forEach(node => {
      if (node.type !== 'rule') {
        return this.#all.push(node)
      }

      let heading = this.#headings.find(heading => heading.name === node.selector)

      if (!heading) {
        return node.error(`\nInvalid heading theme configuration property "${node.selector}"\nValid properties include: ${this.#validHeadings.join(', ')}`)
      }
      
      heading.nodes = node.nodes
    })
  }
}
