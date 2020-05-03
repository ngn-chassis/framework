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

  get collated () {
    let extensions = Object.keys(this.#extensions)

    if (extensions.length > 0) {
      extensions.forEach(name => {
        let extension = this.#extensions[name]

        let parent = this.#components[extension.superclass]

        if (!parent) {
          throw extension.error(`\nCannot extend non-existent component "${extension.superclass}"`)
        }

        parent.addExtension(extension)
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
