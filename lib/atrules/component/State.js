import Class from '../Class.js'
import CSSUtils from '../../utilities/CSSUtils.js'
import QueueUtils from '../../utilities/QueueUtils.js'

// TODO: Automatically reorder states
// Put selectors with pseudo-classes in them at the bottom.
// Check for hover, active, visited, and place them in the proper order

export default class State extends Class {
  #raw = null
  #states = []
  selector = null
  styles = []
  lineage = []
  parent = null

  constructor (cfg) {
    super(cfg)

    this.selector = cfg.selector
    this.styles = cfg.styles
    this.#states = cfg.states.map(rule => new State(rule))
    this.#raw = cfg.raw

    // TODO: Sort states
    // this.states = cfg.states.map(state => new State(state))
  }

  get raw () {
    return this.#raw
  }

  get states () {
    return this.#states
  }

  get hasStates () {
    return this.#states.length > 0
  }

  get hasStyles () {
    return this.styles.length > 0
  }

  getState (name) {
    return this.states.find(state => state.name === name)
  }

  hasState (name) {
    return this.states.some(state => state.name === name)
  }

  resolve (component, theme, cb) {
    let rule

    theme = (theme && theme.states.length > 0)
      ? theme.states.find(state => state.name === this.name)
      : null

    QueueUtils.run({
      log: false,

      tasks: [{
        name: `Generating State Rule`,
        callback: next => {
          rule = CSSUtils.createRule(NGN.coalesce(this.selector, component.getStateSelector(this.name)))
          next()
        }
      }, {
        name: 'Generating State Styles',
        callback: next => {
          rule.append(this.styles)

          if (theme) {
            rule.append(theme.nodes)
          }

          // TODO: Handle child states

          next()
        }
      }]
    })
    .then(() => cb(null, rule))
    .catch(cb)
  }
}
