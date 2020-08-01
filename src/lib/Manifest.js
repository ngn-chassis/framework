export default class Manifest {
  #components = {}
  #partials = []
  #modifiers = []
  #modules = {
    internal: {
      core: {},
      components: {}
    },

    custom: {}
  }

  #themes = {}
  #versions = []

  get json () {
    return {
      components: this.#components,
      partials: this.#partials,
      modifiers: this.#modifiers,
      modules: this.#modules,
      themes: this.#themes,
      versions: this.#versions
    }
  }

  get components () {
    return this.#components
  }

  get hasComponents () {
    return Object.keys(this.#components).length > 0
  }

  get coreModules () {
    return this.#modules.internal.core
  }

  get componentModules () {
    return this.#modules.internal.components
  }

  get internalModules () {
    return this.#modules.internal
  }

  get modifiers () {
    return this.#modifiers
  }

  get hasModifiers () {
    return this.#modifiers.length > 0
  }

  get partials () {
    return this.#partials
  }

  get versions () {
    return this.#versions
  }

  addModule (module) {
    Object.keys(module.resources).forEach(resource => {
      if (module.isInternal) {
        if (!this.#modules.internal.hasOwnProperty(module.name)) {
          this.#modules.internal[module.name] = {}
        }

        this.#modules.internal[module.name][resource] = module.resources[resource]
        return
      }

      if (!this.#modules.custom.hasOwnProperty(module.name)) {
        this.#modules.custom[module.name] = {}
      }

      this.#modules.custom[module.name][resource] = module.resources[resource]
    })
  }

  hasInternalModule (name) {
    return this.#modules.internal.hasOwnProperty(name)
  }

  hasCoreModule (name) {
    return this.#modules.internal.core.hasOwnProperty(name)
  }

  addComponent (component) {
    this.#components[component.name] = component
  }

  getComponent (name) {
    return this.#components[name]
  }

  hasComponent (name) {
    return this.#components.hasOwnProperty(name)
  }

  addPartial (partial) {
    this.#partials.push(partial)
  }

  addTheme (theme) {
    this.#themes[theme.name] = theme
  }

  getTheme (name) {
    return this.#themes[name]
  }

  hasTheme (name) {
    return this.#themes.hasOwnProperty(name)
  }

  addVersion (version) {
    this.#versions.push(version)
  }

  hasVersion (theme) {
    return this.#versions.some(version => version.theme === theme)
  }
}
