import Class from '../Class.js'

// TODO: Automatically reorder states
// Put selectors with pseudo-classes in them at the bottom.
// Check for hover, active, visited, and place them in the proper order

export default class State extends Class {
  #source
  #states

  constructor (source, parent) {
    super(...arguments)
    this.#source = source
    this.#states = this.#source.states.map(stateRule => new State(stateRule, this))
  }

  get selector () {
    return this.#source.selector ?? this.parent.selector
  }

  get selectorWithExtensions () {
    return [this.selector, ...this.extensions.map(extension => extension.selectorWithExtensions)].join(', ')
  }

  get selectorWithExtensionsWithMatchingReset () {
    return [
      this.selector,
      ...this.extensions
        .filter(extension => !extension.reset || extension.reset === this.reset)
        .map(extension => extension.selectorWithExtensions)
    ].join(', ')
  }

  get states () {
    return this.#states
  }

  getState (name) {
    return this.states.find(state => state.name === name) ?? this.parent.getState(name)
  }
}
