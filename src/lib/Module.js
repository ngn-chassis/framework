import { CONFIG } from '../index.js'

export default class Module {
  #imp
  #internal
  #source

  constructor (imp) {
    this.#imp = imp
    this.#internal = imp.source.type === 'word'
    this.#source = this.#getSource()
  }

  get isInternal () {
    return this.#internal
  }

  get name () {
    return this.source.name
  }

  get resources () {
    const { resource } = this.#imp

    if (!this.#internal) {
      return console.log('TODO: Support custom modules')
    }

    if (resource === '*') {
      return this.source.resources
    }

    return Array.isArray(resource)
      ? resource.reduce((resources, resource) => {
        resources[resource] = this.source.resources[resource]
        return resources
      }, {})
      : { [resource]: this.source.resources[resource] }
  }

  get source () {
    return this.#source
  }

  #getSource = () => {
    const { core, components } = CONFIG.modules.internal

    switch (this.#imp.source.value) {
      case 'chassis.core': return core
      case 'chassis.components': return components
      default: return console.log('TODO: Support custom modules')
    }
  }
}
