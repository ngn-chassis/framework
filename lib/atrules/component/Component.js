import State from './state/State.js'
import CSSUtils from '../../utilities/CSSUtils.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

// TODO: Automatically reorder states
// Put selectors with pseudo-classes in them at the bottom.
// Check for hover, active, visited, and place them in the proper order

export default class Component {
  #definition = null

  extensions = []
  inline = false
  name = null
  not = null
  reset = null
  selector = null
  states = []
  styles = []
  unset = null

  constructor (definition, inline = false) {
    this.#definition = definition

    this.name = definition.name

    // TODO: Sort states
    // this.states = definition.states.map(state => new State(state))
  }

  get isExtension () {
    return this.#definition.isExtension
  }

  // get hasExtensions () {
  //   return this.extensions.length > 0
  // }
  //
  // get type () {
  //   return 'component'
  // }
  //
  // addExtension (extension) {
  //   this.extensions.push(extension)
  // }
  //
  // error (message, cfg) {
  //   return this.#component.error(...arguments)
  // }
  //
  // getState (name) {
  //   return this.states.find(state => state.name === name)
  // }
  //
  // hasState (name) {
  //   return this.states.some(state => state.name === name)
  // }
  //
  // resolve (cb) {
  //   let root = CSSUtils.createRoot([])
  //
  //   this.resolveSelector((err, result) => {
  //     let selector = result
  //
  //     this.resolveStates((err, result) => {
  //       let rule = CSSUtils.createRule(selector, this.styles)
  //
  //       rule.append(result)
  //       root.append(rule)
  //       cb(null, root)
  //     })
  //   })
  // }
  //
  // resolveSelector (cb, cfg = { addExtensions: true }) {
  //   let selector = this.selector
  //
  //   if (!cfg.addExtensions) {
  //     return cb(null, this.selector)
  //   }
  //
  //   let queue = new NGN.Tasks()
  //
  //   queue.on('complete', () => cb(null, selector))
  //
  //   this.extensions.forEach(extension => {
  //     queue.add('Processing Selector', next => {
  //       extension.resolveSelector((err, result) => {
  //         if (err) {
  //           return cb(err)
  //         }
  //
  //         selector += `, ${result}`
  //         next()
  //       })
  //     })
  //   })
  //
  //   queue.run(true)
  // }
  //
  // resolveStates (target, cb) {
  //   let root = target
  //
  //   if (typeof target === 'function') {
  //     root = CSSUtils.createRoot()
  //     cb = target
  //   }
  //
  //   let queue = new NGN.Tasks()
  //
  //   queue.on('complete', () => cb(null, root))
  //
  //   this.states.forEach(state => {
  //     queue.add('Resolving State', next => {
  //       state.resolve((err, result) => {
  //         if (err) {
  //           return cb(err)
  //         }
  //
  //         // root.append(`/* ${this.name} ${state.name} state */`)
  //         root.append(result)
  //         next()
  //       })
  //     })
  //   })
  //
  //   queue.run(true)
  // }
}
