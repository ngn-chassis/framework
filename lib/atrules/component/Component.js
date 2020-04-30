import State from './State.js'
// import State from './state/State.js'
import CSSUtils from '../../utilities/CSSUtils.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

export default class Component extends State {
  #not = null
  #inline = false
  #reset = null
  #unset = null

  constructor (cfg, inline = false) {
    super(cfg)

    this.#inline = inline
    this.#not = cfg.not
    this.#reset = cfg.reset
    this.#unset = cfg.unset
  }

  get inline () {
    return this.#inline
  }

  get not () {
    return this.#not
  }

  get reset () {
    return this.#reset
  }

  get unset () {
    return this.#unset
  }








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
