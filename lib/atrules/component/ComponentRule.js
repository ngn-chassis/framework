import ClassRule from '../ClassRule.js'
import NotRule from './NotRule.js'
import ResetRule from './ResetRule.js'
import SelectorRule from './SelectorRule.js'
import StateRule from './state/StateRule.js'
import UnsetRule from './UnsetRule.js'

export default class ComponentRule extends ClassRule {
  #validConfigOptions = ['not', 'reset', 'selector', 'state', 'unset']

  selector = null
  styles = []
  states = []
  reset = null
  unset = null
  not = null

  constructor (atrule) {
    super({ type: 'component', root: atrule })
  }

  validate (cb) {
    super.validate(err => {
      if (err) {
        return cb(err)
      }

      this.nodes.forEach(node => {
        if (node.type === 'decl') {
          return this.styles.push(node)
        }

        if (node.type !== 'atrule') {
          return cb(node.error(`\nInvalid @${this.type} configuration property`))
        }

        switch (node.name) {
          case 'not':
            this.not = new NotRule(node).toString()
            return

          case 'reset':
            this.reset = new ResetRule(node).toString()
            return

          case 'selector':
            this.selector = new SelectorRule(node).toString()
            return

          case 'state': return this.states.push(new StateRule(node))

          case 'unset':
            this.unset = new UnsetRule(node).toString()
            return
        }
      })

      cb()
    })
  }

  // validate (cb) {
  //   super.validate(err => {
  //     if (err) {
  //       return cb(err)
  //     }
  //
  //     err = `\nInvalid component configuration.\nConfiguration can only contain CSS Declarations or the following at-rules: ${this.#validConfigOptions.join(', ')}`
  //
  //     let queue = new NGN.Tasks()
  //
  //     queue.on('complete', () => {
  //       cb()
  //       // let states = Reflect.ownKeys(this.states)
  //       //
  //       // if (states.length === 0) {
  //       //   return cb()
  //       // }
  //       //
  //       // this.#validateSubstates(states, cb)
  //     })
  //
  //     this.nodes.forEach(node => {
  //       queue.add(`Validating configuration item`, next => {
  //         if (node.type === 'decl') {
  //           this.styles.push(node)
  //           return next()
  //         }
  //
  //         if (node.type !== 'atrule') {
  //           return cb(node.error(err))
  //         }
  //
  //         switch (node.name) {
  //           case 'reset': return this.#validateReset(node, next, cb)
  //           case 'selector': return this.#validateSelector(node, next, cb)
  //           case 'state': return this.validateState(node, next, cb)
  //           case 'unset': return this.#validateUnset(node, next, cb)
  //           default: return cb(node.error(err))
  //         }
  //
  //         next()
  //       })
  //     })
  //
  //     queue.run(true)
  //   })
  // }
  //
  // #validateReset = (atrule, resolve, reject) => {
  //   // TODO: Complete validation
  //   this.reset = atrule.params
  //   resolve()
  // }
  //
  // // TODO: Complete Unset
  // #validateUnset = (atrule, resolve, reject) => {
  //   this.unset = atrule.params
  //   resolve()
  // }
  //
  // #validateSelector = (atrule, resolve, reject) => {
  //   if (!!this.selector) {
  //     return reject(this.error(`\nDuplicate @selector properties`))
  //   }
  //
  //   let selector = new SelectorRule(this, atrule)
  //
  //   return selector.validate(err => {
  //     if (err) {
  //       return reject(err)
  //     }
  //
  //     this.selector = selector.toString()
  //     resolve()
  //   })
  // }
  //
  // #validateSubstates = (states, cb) => {
  //   let queue = new NGN.Tasks()
  //
  //   queue.on('complete', cb)
  //
  //   states.forEach(state => {
  //     queue.add(`Validating Substates`, next => {
  //       this.states[state].validateStates(this, next, cb)
  //     })
  //   })
  //
  //   queue.run(true)
  // }
}
