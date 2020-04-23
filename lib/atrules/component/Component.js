import State from '../State.js'
import CSSUtils from '../../utilities/CSSUtils.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

// TODO: Automatically reorder states
// Put selectors with pseudo-classes in them at the bottom.
// Check for hover, active, visited, and place them in the proper order

export default class Component {
  #component = null
  extensions = []
  inline = false

  constructor (component, inline = false) {
    this.#component = component
    this.name = component.name
    this.selector = component.selector
    this.reset = component.reset
    this.styles = component.styles
    this.inline = inline

    this.states = Reflect.ownKeys(component.states).map(state => {
      return new State(component.states[state])
    })

    // TODO: Sort states
  }

  addExtension (extension) {
    this.extensions.push(extension)
  }

  error (message, cfg) {
    return this.#component.error(...arguments)
  }

  getState (name) {
    return this.states.find(state => state.name === name)
  }

  hasState (name) {
    return this.states.some(state => state.name === name)
  }

  resolve (cb) {
    let root = CSSUtils.createRoot([])

    this.resolveSelector((err, selector) => {
      let rule = CSSUtils.createRule(selector)
      rule.append(this.styles)

      this.resolveStates(rule, (err, result) => {
        if (err) {
          return cb(err)
        }

        root.append(result)
        cb(null, root)
      })
    })
  }

  resolveSelector (cb) {
    let selector = this.selector
    let queue = new NGN.Tasks()

    queue.on('complete', () => cb(null, selector))

    this.extensions.forEach(extension => {
      if (extension.inline) {
        return queue.add('Resolving Inline Component Extension selector', next => {
          extension.resolveSelector((err, result) => {
            if (err) {
              return cb(err)
            }

            selector += `, ${result}`
            next()
          })
        })
      }

      queue.add('Processing Selector', next => {
        extension.resolveSelector((err, result) => {
          if (err) {
            return cb(err)
          }

          selector += `, ${result}`
          next()
        })

        // SelectorUtils.getNestedSelectorList(this.selector, extension.selector, result => {
        //   selector += `, ${result.join(', ')}`
        //   next()
        // })
      })
    })

    queue.run(true)
  }

  resolveStates (target, cb) {
    let queue = new NGN.Tasks()

    queue.on('complete', () => cb(null, target))

    this.states.forEach(state => {
      queue.add('Resolving State', next => {
        state.resolve((err, result) => {
          if (err) {
            return cb(err)
          }

          target.append(result)
          next()
        })
      })
    })

    queue.run(true)
  }
}
