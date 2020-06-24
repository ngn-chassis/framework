import Stylesheet from '../../Stylesheet.js'
import CSSUtils from '../../utilities/CSSUtils.js'

export default class Resource {
  #root = null
  #name = null

  constructor (imp) {
    let { resource } = imp.args

    this.#root = imp.root
    this.type = imp.type
  }

  error (message, cfg) {
    return this.#root.error(message, cfg)
  }

  replaceWith (root) {
    this.#root.replaceWith(root)
  }
}
