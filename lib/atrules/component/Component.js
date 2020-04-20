import State from './State.js'
import CSSUtils from '../../utilities/CSSUtils.js'

// TODO: Automatically reorder states
// Put selectors with pseudo-classes in them at the bottom.
// Check for hover, active, visited, and place them in the proper order

export default class Component {
  #extensions = []

  constructor (component) {
    this.name = component.name
    this.selector = component.selector
    this.reset = component.reset
    this.states = component.states.map(state => new State(state))
  }

  get extensions () {
    return this.#extensions
  }

  addExtension (extension) {
    this.#extensions.push(extension)
  }

  resolve () {
    let root = CSSUtils.createRoot([])
    let rule = CSSUtils.createRule(this.selector)

    this.states.forEach(state => rule.append(state.resolve()))
    root.append(rule)
    return root
  }
}
