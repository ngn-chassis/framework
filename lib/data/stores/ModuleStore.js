export default class ModuleStore {
  #modules = {}

  get data () {
    return this.#modules
  }

  add (imp, funcs) {
    let module = imp.source

    if (!this.has(module)) {
      this.#modules[module] = funcs
      return
    }

    Object.keys(funcs).forEach(name => {
      if (this.#modules[module].hasOwnProperty(name)) {
        throw imp.error(`\nDuplicate module import "${name}"`, { word: name })
      }
    })

    this.#modules[module] = Object.assign(this.#modules[module], funcs)
  }

  get (name) {
    return this.#modules[name]
  }

  has (name) {
    return this.#modules.hasOwnProperty(name)
  }
}
