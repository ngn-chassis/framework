export default class ComponentStore {
  #components = {}

  get extensions () {
    return Reflect.ownKeys(this.#components).reduce((components, name) => {
      let component = this.#components[name]

      if (component.isExtension) {
        components.push(component)
      }

      return components
    }, [])
  }

  add (component) {
    let { name } = component

    if (this.has(name)) {
      throw component.error(`\nDuplicate component "${name}"`, { word: name })
    }

    this.#components[name] = component
  }

  has (name) {
    return this.#components.hasOwnProperty(name)
  }

  validate (cb) {

  }
}
