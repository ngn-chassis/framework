import Component from './Component.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

export default class ExtensionComponent extends Component {
  #component = null
  #statesReconciled = false

  constructor (parent, component, inline = false) {
    super(component)

    this.#component = component
    this.parent = parent
    this.extends = component.extends
    this.reset = NGN.coalesce(component.reset, parent.reset)
    this.inline = inline
  }

  getState (name) {
    return NGN.coalesce(this.states.find(state => state.name === name), this.parent.getState(name))
  }

  hasState (name) {
    return NGN.coalesce(this.states.some(state => state.name === name), this.parent.hasState(name))
  }

  resolve (cb) {
    this.#reconcileStates(err => {
      if (err) {
        return cb(err)
      }

      this.resolveSelector((err, selector) => {
        if (err) {
          return cb(err)
        }

        super.resolve(cb)
      })
    })
  }

  resolveSelector (cb) {
    if (this.inline) {
      return cb(null, this.selector)
    }

    return SelectorUtils.getNestedSelectorList(this.parent.selector, this.selector, result => {
      cb(null, result.join(', '))
    })
  }

  resolveStates (target, cb) {
    this.#reconcileStates(err => {
      if (err) {
        return cb(err)
      }

      super.resolveStates(...arguments)
    })
  }

  #reconcileStates = cb => {
    if (this.#statesReconciled) {
      return cb()
    }

    let queue = new NGN.Tasks()

    queue.on('complete', () => {
      this.#statesReconciled = true
      cb()
    })

    this.states.forEach(state => {
      queue.add('Reconciling State', next => {
        if (!!state.selector) {
          return next()
        }

        if (!this.parent.hasState(state.name)) {
          return cb(state.error(`\nState "${state.name}" requires an @selector property`))
        }

        let parentState = this.parent.getState(state.name)
        state.selector = parentState.selector
        next()
      })
    })

    queue.run(true)
  }
}
