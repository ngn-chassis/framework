import nesting from 'postcss-nesting'

export default class Theme {
  #root = null
  #components = []
  #headings = []
  #sharedHeadingStyles = []

  constructor (rule) {
    this.#root = rule.root
    this.#headings = NGN.coalesce(rule.headings, [])
    this.#components = rule.components
    this.#sharedHeadingStyles = rule.sharedHeadingStyles

    this.name = rule.args.name.value
    this.properties = rule.properties
  }

  get components () {
    return this.#components
  }

  get css () {
    return this.#root.toString()
  }

  get headings () {
    return this.#headings
  }

  get sharedHeadingStyles () {
    return this.#sharedHeadingStyles
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
