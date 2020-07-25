import StateRule from './StateRule.js'

export default class ComponentRule extends StateRule {
  get not () {
    return this.getProperty('not')?.params ?? null
  }

  get reset () {
    return this.getProperty('reset')?.params ?? null
  }

  get unset () {
    return this.getProperty('unset')?.params ?? null
  }
}

// export default class ComponentRule extends StateRule {
//   reset = null
//   unset = null
//   not = null
//
//   constructor (atrule) {
//     super(atrule)
//
//     atrule.nodes.forEach(node => {
//       switch (node.name) {
//         case 'not':
//           this.not = new NotRule(node).toString()
//           return
//
//         case 'reset':
//           this.reset = new ResetRule(node).toString()
//           return
//
//         case 'unset':
//           this.unset = new UnsetRule(node).toString()
//           return
//       }
//     })
//   }
//
//   // validate (cb) {
//   //   super.validate(err => {
//   //     if (err) {
//   //       return cb(err)
//   //     }
//   //
//   //     err = `\nInvalid component configuration.\nConfiguration can only contain CSS Declarations or the following at-rules: ${this.#validConfigOptions.join(', ')}`
//   //
//   //     let queue = new NGN.Tasks()
//   //
//   //     queue.on('complete', () => {
//   //       cb()
//   //       // let states = Reflect.ownKeys(this.states)
//   //       //
//   //       // if (states.length === 0) {
//   //       //   return cb()
//   //       // }
//   //       //
//   //       // this.#validateSubstates(states, cb)
//   //     })
//   //
//   //     this.nodes.forEach(node => {
//   //       queue.add(`Validating configuration item`, next => {
//   //         if (node.type === 'decl') {
//   //           this.styles.push(node)
//   //           return next()
//   //         }
//   //
//   //         if (node.type !== 'atrule') {
//   //           return cb(node.error(err))
//   //         }
//   //
//   //         switch (node.name) {
//   //           case 'reset': return this.#validateReset(node, next, cb)
//   //           case 'selector': return this.#validateSelector(node, next, cb)
//   //           case 'state': return this.validateState(node, next, cb)
//   //           case 'unset': return this.#validateUnset(node, next, cb)
//   //           default: return cb(node.error(err))
//   //         }
//   //
//   //         next()
//   //       })
//   //     })
//   //
//   //     queue.run(true)
//   //   })
//   // }
//   //
//   // #validateReset = (atrule, resolve, reject) => {
//   //   // TODO: Complete validation
//   //   this.reset = atrule.params
//   //   resolve()
//   // }
//   //
//   // // TODO: Complete Unset
//   // #validateUnset = (atrule, resolve, reject) => {
//   //   this.unset = atrule.params
//   //   resolve()
//   // }
//   //
//   // #validateSelector = (atrule, resolve, reject) => {
//   //   if (!!this.selector) {
//   //     return reject(this.error(`\nDuplicate @selector properties`))
//   //   }
//   //
//   //   let selector = new SelectorRule(this, atrule)
//   //
//   //   return selector.validate(err => {
//   //     if (err) {
//   //       return reject(err)
//   //     }
//   //
//   //     this.selector = selector.toString()
//   //     resolve()
//   //   })
//   // }
//   //
//   // #validateSubstates = (states, cb) => {
//   //   let queue = new NGN.Tasks()
//   //
//   //   queue.on('complete', cb)
//   //
//   //   states.forEach(state => {
//   //     queue.add(`Validating Substates`, next => {
//   //       this.states[state].validateStates(this, next, cb)
//   //     })
//   //   })
//   //
//   //   queue.run(true)
//   // }
// }
