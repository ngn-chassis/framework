import fs from 'fs-extra'
import parser from 'postcss-scss'

export default class Stylesheet {
  #root
  #filepath

  constructor (filepath) {
    this.#root = parser.parse(fs.readFileSync(filepath), { from: filepath })
    this.#filepath = filepath
  }

  get children () {
    return []
  }

  get filepath () {
    return this.#filepath
  }

  get root () {
    return this.#root
  }

  append (css) {
    this.#root.append(css)
  }

  clone () {
    return this.#root.clone()
  }

  prepend (css) {
    this.#root.prepend(css)
  }

  toString () {
    return this.#root.toString()
  }

  walkAtRules () {
    return this.#root.walkAtRules(...arguments)
  }
}
