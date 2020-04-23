import Component from './Component.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

export default class ComponentInstance extends Component {
  #component = null
  #statesReconciled = false

  constructor (parent, component, inline = false) {
    super(component, inline)

    this.#component = component
    this.parent = parent
    this.superclass = component.superclass
    this.reset = NGN.coalesce(component.reset, parent.reset)
  }

  get type () {
    return 'instance'
  }

  resolve (cb) {
    this.#reconcileStates(err => {
      if (err) {
        return cb(err)
      }

      super.resolve(cb)
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
