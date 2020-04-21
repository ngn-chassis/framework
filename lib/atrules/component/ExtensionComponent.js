import Component from './Component.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

export default class ExtensionComponent extends Component {
  #component = null

  constructor (parent, component) {
    super(component)

    this.#component = component
    this.parent = parent
    this.extends = component.extends
    this.reset = NGN.coalesce(component.reset, parent.reset)
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

      SelectorUtils.getNestedSelectorList(this.parent.selector, this.selector, result => {
        this.selector = result.join(', ')
        super.resolve(cb)
      })
    })
  }

  #reconcileStates = cb => {
    let queue = new NGN.Tasks()

    queue.on('complete', cb)

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
