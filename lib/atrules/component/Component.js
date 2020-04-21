import State from './State.js'
import CSSUtils from '../../utilities/CSSUtils.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

import nesting from 'postcss-nesting'

// TODO: Automatically reorder states
// Put selectors with pseudo-classes in them at the bottom.
// Check for hover, active, visited, and place them in the proper order

export default class Component {
  #extensions = []

  constructor (component) {
    this.name = component.name
    this.selector = component.selector
    this.reset = component.reset
    this.styles = component.styles

    this.states = Reflect.ownKeys(component.states).map(state => {
      return new State(component.states[state])
    })

    // TODO: Sort states
  }

  get extensions () {
    return this.#extensions
  }

  addExtension (extension) {
    this.#extensions.push(extension)
  }

  getState (name) {
    return this.states.find(state => state.name === name)
  }

  hasState (name) {
    return this.states.some(state => state.name === name)
  }

  resolve (cb) {
    let root = CSSUtils.createRoot([])

    this.#getSelector((err, selector) => {
      let rule = CSSUtils.createRule(selector)
      rule.append(this.styles)

      let queue = new NGN.Tasks()

      queue.on('complete', () => {
        root.append(rule)
        cb(null, root)
      })

      this.states.forEach(state => {
        queue.add('Resolving State', next => {
          state.resolve((err, result) => {
            if (err) {
              return cb(err)
            }

            rule.append(result)
            next()
          })
        })
      })

      queue.run(true)
    })
  }

  #getSelector = cb => {
    let selector = this.selector
    let queue = new NGN.Tasks()

    queue.on('complete', () => {
      cb(null, selector)
    })

    this.extensions.forEach(extension => {
      queue.add('Processing Selector', next => {
        SelectorUtils.getNestedSelectorList(this.selector, extension.selector, result => {
          selector += `, ${result.join(', ')}`
          next()
        })
      })
    })

    queue.run(true)
  }
}
