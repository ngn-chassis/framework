export default class ModuleManager {
  #modules = {}

  get modules () {
    return this.#modules
  }

  addModule (imp, funcs) {
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

  getModule (name) {
    return this.#modules[name]
  }

  hasModule (name) {
    return this.#modules.hasOwnProperty(name)
  }
}
