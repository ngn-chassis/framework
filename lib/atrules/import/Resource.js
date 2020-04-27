import Stylesheet from '../../Stylesheet.js'
import CSSUtils from '../../utilities/CSSUtils.js'

export default class Resource {
  #root = null
  #index = null
  #name = null

  id = NGN.DATA.util.GUID()
  components = []
  placeholders = []
  themes = {}
  versions = []

  constructor (imp) {
    let { resource } = imp.args

    this.#root = imp.root
    this.#index = resource.index
    this.type = imp.type
  }

  // get hasPlaceholders () {
  //   return this.placeholders.length > 0
  // }

  // addImport (cfg, accept, reject) {
  //   let stylesheet = new Stylesheet(cfg)
  //
  //   stylesheet.analyze(err => {
  //     if (err) {
  //       return reject(err)
  //     }
  //
  //     stylesheet.validate(err => {
  //       if (err) {
  //         return reject(err)
  //       }
  //
  //       if (!this.hasPlaceholders) {
  //         this.#root.replaceWith(`@placeholder import ${this.id};`)
  //       }
  //
  //       this.placeholders.push(stylesheet)
  //       this.components.push(...stylesheet.components)
  //       this.themes = Object.assign(this.themes, stylesheet.themes)
  //       this.versions.push(...stylesheet.versions)
  //
  //       accept()
  //     })
  //   })
  // }

  error (message) {
    return this.#root.error(message, { index: this.#index })
  }

  get root () {
    let root = CSSUtils.createRoot([])

    this.placeholders.forEach(placeholder => {
      root.append(placeholder.resolve())
    })

    return root
  }

  resolve () {
    return this.root
  }
}
