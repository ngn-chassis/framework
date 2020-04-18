import nesting from 'postcss-nesting'

export default class Theme {
  #root = null
  #components = []
  #headings = []

  constructor (theme) {
    this.#root = theme.root
    this.#headings = theme.headings.filter(heading => heading.nodes.length > 0)
    this.#components = theme.components

    this.name = theme.args.name.value
    this.properties = theme.properties
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
