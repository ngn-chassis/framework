import CSSUtils from '../../utilities/CSSUtils.js'

export default class Resource {
  #root = null
  #index = null
  #name = null

  imports = []

  constructor (parent, imp) {
    let { resource } = imp.args

    this.#root = imp.root
    this.#index = resource.index
    this.type = imp.type
  }

  get hasImports () {
    return this.imports.length > 0
  }

  get components () {
    return this.#get('components')
  }

  get exports () {
    return this.#get('exports')
  }

  get mixins () {
    return this.#get('mixins')
  }

  get themes () {
    return this.#get('themes')
  }

  get utilities () {
    return this.#get('utilities')
  }

  get versions () {
    return this.#get('versions')
  }

  error (message) {
    return this.#root.error(message, { index: this.#index })
  }

  resolve (cb) {
    let root = CSSUtils.createRoot([])
    this.imports.forEach(stylesheet => root.append(stylesheet.root))
    this.#root.replaceWith(root)
    cb()
  }

  #get = name => this.imports.reduce((collection, stylesheet) => {
    collection.push(...stylesheet[name])
    return collection
  }, [])
}
