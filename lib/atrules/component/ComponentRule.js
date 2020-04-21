import Class from '../Class.js'
import StateRule from './StateRule.js'
import Selector from './Selector.js'
// import ComponentUtils from '../utilities/ComponentUtils.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

export default class ComponentRule extends Class {
  #validConfigOptions = ['selector', 'reset', 'state']

  name = null
  states = {}
  styles = []
  extends = null

  constructor (atrule) {
    super({ root: atrule })
  }

  getState (name) {
    return this.states[name]
  }

  hasState (name) {
    return this.states.hasOwnProperty(name)
  }

  validate (components, cb) {
    super.validate(err => {
      if (err) {
        return cb(err)
      }

      err = `\nInvalid component configuration.\nConfiguration can only contain CSS Declarations or the following at-rules: ${this.#validConfigOptions.join(', ')}`

      let queue = new NGN.Tasks()

      queue.on('complete', () => {
        let states = Reflect.ownKeys(this.states)

        if (states.length === 0) {
          return cb()
        }

        this.#validateSubstates(states, cb)
      })

      this.nodes.forEach(node => {
        queue.add(`Validating configuration item`, next => {
          if (node.type === 'decl') {
            this.styles.push(node)
            return next()
          }

          if (node.type !== 'atrule') {
            return cb(node.error(err))
          }

          switch (node.name) {
            case 'selector': return this.#validateSelector(node, next, cb)
            case 'reset': return this.#validateReset(node, next, cb)
            case 'state': return this.#validateState(node, next, cb)
            default: return cb(node.error(err))
          }

          next()
        })
      })

      queue.run(true)
    })
  }

  #validateReset = (atrule, resolve, reject) => {
    // TODO: Complete validation
    this.reset = atrule.params
    resolve()
  }

  #validateSelector = (atrule, resolve, reject) => {
    if (!!this.selector) {
      return reject(this.error(`\nDuplicate @selector properties`))
    }

    let selector = new Selector(this, atrule)

    return selector.validate(err => {
      if (err) {
        return reject(err)
      }

      this.selector = selector.toString()
      resolve()
    })
  }

  #validateState = (atrule, resolve, reject) => {
    let state = new StateRule(this, atrule)

    state.validate(err => {
      if (err) {
        return reject(err)
      }

      if (this.hasState(state.name)) {
        return reject(atrule.error(`\nDuplicate state "${state.name}"`, { word: state.name }))
      }

      if (!this.extends && !state.selector) {
        return reject(atrule.error(`\nState "${state.name}" requires an @selector property`, { word: state.name }))
      }

      this.states[state.name] = state
      resolve()
    })
  }

  #validateSubstates = (states, cb) => {
    let queue = new NGN.Tasks()

    queue.on('complete', cb)

    states.forEach(state => {
      queue.add('Validating Substates', next => {
        this.states[state].validateStates(next, cb)
      })
    })

    queue.run(true)
  }
}
