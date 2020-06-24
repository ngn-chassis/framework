import nesting from 'postcss-nesting'

import State from './State.js'
// import State from './state/State.js'
import CSSUtils from '../../utilities/CSSUtils.js'
import QueueUtils from '../../utilities/QueueUtils.js'
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

  getStateSelector (name) {
    let state = super.getState(name)

    if (!state) {
      throw this.error(`\nInvalid state @${name}`)
    }

    let { selector } = state

    if (!!selector) {
      return selector
    }

    if (!this.parent) {
      return null
    }

    return this.parent.getStateSelector(name)
  }

  resolve (theme, cb) {
    let root = CSSUtils.createRoot()
    theme = theme.components.find(component => component.name === this.name)

    this.resolveSelectorWithExtensions((err, selector) => {
      let rule = CSSUtils.createRule(selector)
      rule.append(this.styles)

      if (theme && theme.styles.length > 0) {
        rule.append(theme.styles)
      }

      let finish = () => {
        root.append(rule)
        cb(null, rule)
      }

      if (!this.hasStates) {
        return finish()
      }

      QueueUtils.run({
        log: false,

        tasks: this.states.map(state => ({
          name: `Resolving "${state.name}" state`,
          callback: next => state.resolve(this, theme, (err, result) => {
            if (err) {
              return cb(err)
            }

            rule.append(result)
            next()
          })
        }))
      })
      .then(finish)
      .catch(cb)
    })
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
        cb(null, `${result.root.nodes[0].selector}${standalone.length > 0 ? `, ${standalone.join(', ')}` : ''}`)
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
