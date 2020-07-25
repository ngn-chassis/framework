import ClassRule from '../ClassRule.js'
// import SelectorRule from './SelectorRule.js'

export default class StateRule extends ClassRule {
  get selector () {
    return this.getProperty('selector')?.params ?? null
  }

  get states () {
    let states = this.getProperty('state')

    if (!states) {
      return []
    }

    if (!Array.isArray(states)) {
      states = [states]
    }

    return states.map(state => new StateRule(state))
  }

  // get selector () {
  //   return this.getProperty('selector')?.params ?? null
  // }

  // get states () {
  //   return this.getProperty('state') ?? []
  // }
}

// export default class StateRule extends ClassRule {
//   selector = null
//   states = []
//   styles = []
//
//   constructor (atrule) {
//     super({ root: atrule })
//
//     atrule.nodes.forEach(node => {
//       if (node.type !== 'atrule') {
//         return this.styles.push(node)
//       }
//
//       switch (node.name) {
//         case 'selector':
//           this.selector = new SelectorRule(node).toString()
//           return
//
//         case 'state': return this.states.push(new StateRule(node))
//       }
//     })
//   }
//
//   // getState (name) {
//   //   return this.states[name]
//   // }
//   //
//   // hasState (name) {
//   //   return Reflect.ownKeys(this.states).includes(name)
//   // }
//   //
//   // addState (atrule, resolve, reject) {
//   //   let state = new StateRule(this, atrule)
//   //
//   //   return state.validate(err => {
//   //     console.log(`Parent ${state.parentComponent.name}`)
//   //     console.log(`  State ${state.name}`)
//   //     console.log(`    Selector ${state.selector}`)
//   //     if (err) {
//   //       return reject(err)
//   //     }
//   //
//   //     // if (!state.selector) {
//   //     //   console.log(this.parentComponent);
//   //     //   console.log(this.parentComponent.hasState(state.name));
//   //     //   let parentState = this.parent.getState(state.name)
//   //     //
//   //     //   if (!parentState) {
//   //     //     return reject(atrule.error(`\nCustom state "${state.name}" requires an @selector property`))
//   //     //   }
//   //     //
//   //     //   state.selector = parentState.selector
//   //     // }
//   //
//   //     this.states[state.name] = state
//   //     atrule.remove()
//   //     resolve()
//   //   })
//   // }
//   //
//   // validate (cb) {
//   //   super.validate(err => {
//   //     if (err) {
//   //       return cb(err)
//   //     }
//   //
//   //     // this.name = this.args.name.value
//   //
//   //     let queue = new NGN.Tasks()
//   //
//   //     queue.on('complete', cb)
//   //
//   //     this.nodes.forEach(node => {
//   //       queue.add('Processing node', next => {
//   //         if (node.type !== 'atrule') {
//   //           this.styles.push(node)
//   //           return next()
//   //         }
//   //
//   //         switch (node.name) {
//   //           case 'selector': return this.#validateSelector(node, (err, selector) => {
//   //             if (err) {
//   //               return cb(err)
//   //             }
//   //
//   //             this.selector = selector
//   //             node.remove()
//   //             next()
//   //           })
//   //
//   //           case 'state':
//   //             this.#substates.push(node)
//   //             return next()
//   //
//   //           default: return cb(this.error(`\n${this.#err}\nValid properties include CSS declarations, nested rules, and the following at-rules: ${this.#validAtRules.map(atrule => `@${atrule}`).join(', ')}`))
//   //         }
//   //       })
//   //     })
//   //
//   //     queue.run(true)
//   //   })
//   // }
//   //
//   // validateStates (parentComponent, resolve, reject) {
//   //   this.parentComponent = parentComponent
//   //   let queue = new NGN.Tasks()
//   //
//   //   queue.on('complete', () => {
//   //     let states = Reflect.ownKeys(this.states)
//   //
//   //     if (states.length === 0) {
//   //       return resolve()
//   //     }
//   //
//   //     this.#validateSubstates(states, resolve, reject)
//   //   })
//   //
//   //   this.#substates.forEach(atrule => {
//   //     queue.add(`Adding Sub-State`, next => {
//   //       this.addState(atrule, next, reject)
//   //     })
//   //   })
//   //
//   //   queue.run(true)
//   // }
//   //
//   // #validateSelector = (atrule, cb) => {
//   //   if (!!this.selector) {
//   //     return cb(this.error(`\n${this.#err}\nDuplicate @selector properties`))
//   //   }
//   //
//   //   let selector = new SelectorRule(this, atrule, true)
//   //
//   //   selector.validate(err => {
//   //     if (err) {
//   //       return cb(err)
//   //     }
//   //
//   //     cb(null, selector.toString())
//   //   })
//   // }
//   //
//   // #validateSubstates = (states, resolve, reject) => {
//   //   let queue = new NGN.Tasks()
//   //
//   //   queue.on('complete', resolve)
//   //
//   //   states.forEach(state => {
//   //     queue.add('Validating Sub-State', next => {
//   //       this.states[state].validateStates(this.parentComponent, next, reject)
//   //     })
//   //   })
//   //
//   //   queue.run(true)
//   // }
// }
