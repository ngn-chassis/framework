import AtRule from './AtRule.js'

export default class Theme extends AtRule {
  constructor (atRule) {
    super(atRule)

    this.name = this.args[0]
      ? this.args[0].type === 'word'
        ? this.args[0].value
        : null
      : 'default'
  }

  // TODO: Add more validation
  get isValid () {
    return !!this.name
  }

  get components () {
    return this.nodes.map(node => {
      console.log(node)
      return node
    })
  }

  get css () {
    return {}
  }

  get headings () {
    return {}
  }

  get properties () {
    return {}
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
