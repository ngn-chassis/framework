import Component from './Component.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

export default class ComponentExtension extends Component {
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
    return 'extension'
  }

  getState (name) {
    return NGN.coalesce(this.states.find(state => state.name === name), this.parent.getState(name))
  }

  hasState (name) {
    return this.states.some(state => state.name === name) || this.parent.hasState(name)
  }

  resolveSelector (cb, cfg = { addExtensions: true, resolveParent: true }) {
    if (this.inline) {
      return cb(null, this.selector)
    }

    let selector = this.selector
    let parentSelector = this.parent.selector
    let queue = new NGN.Tasks()

    queue.on('complete', () => cb(null, selector))

    if (this.parent.type === 'extension') {
      queue.add('Resolving Parent Selector', next => {
        this.parent.resolveSelector((err, result) => {
          if (err) {
            return cb(err)
          }

          parentSelector = result
          next()
        }, { addExtensions: false })
      })
    }

    if (cfg.addExtensions && this.hasExtensions) {
      this.extensions.forEach(extension => {
        queue.add('Resolving Extension Selector', next => {
          extension.resolveSelector((err, result) => {
            if (err) {
              return cb(err)
            }

            selector += `, ${result}`
            next()
          })
        })
      })
    }

    queue.add('Resolving Selector', next => {
      let parts = this.#getSelectorParts(SelectorUtils.clean(selector, true))

      if (parts.nested.length === 0) {
        return next()
      }

      SelectorUtils.getNestedSelectorList(parentSelector, parts.nested.join(', '), result => {
        selector = `${result.join(', ')}${parts.normal.length > 0 ? `, ${parts.normal.join(', ')}` : ''}`
        next()
      })
    })

    queue.run(true)
  }

  resolveStates (target, cb) {
    this.#reconcileStates(err => {
      if (err) {
        return cb(err)
      }

      super.resolveStates(...arguments)
    })
  }

  #getSelectorParts = selector => selector.reduce((parts, result) => {
    if (result.startsWith('&')) {
      parts.nested.push(result)
    } else {
      parts.normal.push(result)
    }

    return parts
  }, {
    normal: [],
    nested: []
  })

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
