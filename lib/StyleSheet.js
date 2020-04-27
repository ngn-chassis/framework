import ImportRule from './atrules/import/ImportRule.js'
import ComponentRule from './atrules/component/ComponentRule.js'
import ThemeRule from './atrules/theme/ThemeRule.js'
import MakeRule from './atrules/make/MakeRule.js'

export default class Stylesheet {
  #root = null
  imported = false

  imports = []
  components = []
  themes = []
  versions = []

  constructor (root, filepath, imported = false) {
    this.#root = root
    this.filepath = NGN.coalesce(filepath, 'chassis')
    this.imported = imported

    this.#root.walkAtRules(atrule => {
      switch (atrule.name) {
        case 'import': return this.imports.push(new ImportRule(atrule))
        case 'component': return this.components.push(new ComponentRule(atrule))
        case 'theme': return this.themes.push(new ThemeRule(atrule))
        case 'make': return this.versions.push(new MakeRule(atrule))
      }
    })
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
}
