import nesting from 'postcss-nesting'

import Class from '../Class.js'
import CSSUtils from '../../utilities/CSSUtils.js'
import QueueUtils from '../../utilities/QueueUtils.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

// TODO: Automatically reorder states
// Put selectors with pseudo-classes in them at the bottom.
// Check for hover, active, visited, and place them in the proper order

export default class State extends Class {
  #states = []
  #styles = []
  selector = null
  lineage = []
  parent = null

  constructor (cfg) {
    super(cfg)

    this.selector = cfg.selector
    this.#styles = cfg.styles
    this.#states = cfg.states.map(rule => new State(rule))

    // TODO: Sort states
    // this.states = cfg.states.map(state => new State(state))
  }

  get states () {
    return this.#states
  }

  get hasStates () {
    return this.#states.length > 0
  }

  get styles () {
    return this.#styles
  }

  get hasStyles () {
    return this.#styles.length > 0
  }

  getState (name) {
    return this.states.find(state => state.name === name)
  }

  hasState (name) {
    return this.states.some(state => state.name === name)
  }

  resolveSelector (cb) {
    if (!this.isExtension) {
      return cb(null, this.selector)
    }

    let { nested, standalone } = SelectorUtils.parse(this.selector)

    if (nested.length === 0) {
      return cb(null, standalone.join(', '))
    }

    this.parent.resolveSelector((err, result) => {
      if (err) {
        return cb(err)
      }

      let root = CSSUtils.createRoot()
      let rule = CSSUtils.createRule(result)

      nested.forEach(selector => rule.append(CSSUtils.createRule(selector)))
      root.append(rule)

      nesting.process(root, { from: void 0 }).then(result => {
        cb(null, result.root.nodes[0].selector + `, ${standalone.join(', ')}`)
      }).catch(cb)
    })
  }

  resolveSelectorWithExtensions (cb) {
    this.resolveSelector((err, selector) => {
      if (!this.hasExtensions) {
        return cb(null, selector)
      }

      QueueUtils.run({
        log: false,

        tasks: this.extensions.map(extension => ({
          name: 'Resolving Extension Selector',
          callback: next => extension.resolveSelectorWithExtensions((err, result) => {
            selector += `, ${result}`
            next()
          })
        }))
      })
      .then(() => cb(null, selector))
      .catch(cb)
    })
  }
}



// import Base from '../Base.js'
// import CSSUtils from '../../../utilities/CSSUtils.js'
//
// export default class State extends Base {
//   // error (message, cfg) {
//   //   return this.#state.error(message, cfg)
//   // }
//   //
//   // resolve (cb) {
//   //   let root = this.selector ? CSSUtils.createRule(this.selector) : CSSUtils.createRoot([])
//   //   root.append(this.styles)
//   //
//   //   let queue = new NGN.Tasks()
//   //
//   //   queue.on('complete', () => cb(null, root))
//   //
//   //   this.states.forEach(state => {
//   //     queue.add('Resolving State', next => {
//   //       state.resolve((err, result) => {
//   //         if (err) {
//   //           return cb(err)
//   //         }
//   //
//   //         root.append(result)
//   //         next()
//   //       })
//   //     })
//   //   })
//   //
//   //   queue.run(true)
//   // }
// }
