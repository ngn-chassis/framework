import nesting from 'postcss-nesting'

export default class Theme {
  #root = null
  #components = []
  #headings = []

  constructor (rule) {
    this.#root = rule.root
    this.#headings = rule.headings.filter(heading => heading.nodes.length > 0)
    this.#components = rule.components

    this.name = rule.args.name.value
    this.properties = rule.properties
  }

  get components () {
    return this.#components.map(component => {
      component.nodes = nesting.process(component.nodes).root
      return component
    })
  }

  get css () {
    return this.#root.toString()
  }

  get headings () {
    return this.#headings.map(heading => {
      heading.nodes = nesting.process(heading.nodes).root
      return heading
    })
  }

  get json () {
    return {
      name: this.name,
      properties: this.properties,
      headings: this.headings,
      components: this.components,
      css: this.css
    }
  }
}
