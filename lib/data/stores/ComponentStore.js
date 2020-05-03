export default class ComponentStore {
  #components = {}
  #extensions = {}

  get extensions () {
    return Reflect.ownKeys(this.#components).reduce((components, name) => {
      let component = this.#components[name]

      if (component.isExtension) {
        components.push(component)
      }

      return components
    }, [])
  }

  #generateLineage = (component, store = true) => {
    if (!component.isExtension) {
      return []
    }

    let lineage = []
    let parent = this.data[component.superclass]

    if (!parent) {
      throw component.error(`\nCannot extend non-existent component "${component.superclass}"`)
    }

    lineage.unshift(parent)

    if (store) {
      component.parent = parent
      parent.addExtension(component)
    }

    return [...this.#generateLineage(parent, false), ...lineage]
  }

  get collated () {
    let extensions = Object.keys(this.#extensions)

    if (extensions.length > 0) {
      extensions.forEach(name => {
        let extension = this.#extensions[name]
        extension.lineage = this.#generateLineage(extension)
      })
    }

    return this.#components
  }

  get data () {
    return Object.assign(this.#components, this.#extensions)
  }

  add (component) {
    let { name } = component

    if (this.has(name)) {
      throw component.error(`\nDuplicate component "${name}"`, { word: name })
    }

    if (component.isExtension) {
      this.#extensions[name] = component
    } else {
      this.#components[name] = component
    }
  }

  has (name) {
    return this.#components.hasOwnProperty(name) || this.#extensions.hasOwnProperty(name)
  }
}
