import Class from '../Class.js'
import AtRule from '../AtRule.js'
// import ComponentUtils from '../utilities/ComponentUtils.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

class StateRule extends AtRule {
  #validAtRules = ['selector', 'state']
  #err = `Invalid component state configuration`
  #substates = []

  name = null
  selector = null
  states = []

  constructor (parent, atrule) {
    super({
      root: atrule,
      parent,

      format: '<name>',

      args: [
        {
          name: 'name',
          types: ['word'],
          required: true
        }
      ]
    })
  }

  validate (cb) {
    super.validate(err => {
      if (err) {
        return cb(err)
      }
    })

    this.name = this.args.name.value

    let queue = new NGN.Tasks()

    queue.on('complete', cb)

    this.nodes.forEach(node => {
      queue.add('Processing node', next => {
        if (node.type !== 'atrule') {
          return next()
        }

        this.#processAtRule(node, next, cb)
      })
    })

    queue.add('Appending styles', next => {
      this.styles = this.nodes.filter(node => node.type !== 'atrule')
      next()
    })

    queue.add('Processing substates', next => this.#processSubstates(next, cb))

    queue.run(true)
  }

  #processSubstates = (accept, reject) => {
    let queue = new NGN.Tasks()

    queue.on('complete', accept)

    this.#substates.forEach(atrule => {
      queue.add('Adding substate', next => {
        this.addState(atrule, next, reject)
      })
    })

    queue.run(true)
  }

  hasState (name) {
    return this.states.some(state => state.name === name)
  }

  addState (atrule, accept, reject) {
    let state = new StateRule(this, atrule)

    return state.validate(err => {
      if (err) {
        return reject(err)
      }

      if (!state.selector) {
        let parentState = this.parent.getState(state.name)

        if (!parentState) {
          return reject(atrule.error(`\nCustom state "${state.name}" requires an @selector property`))
        }

        state.selector = parentState.selector
      }

      this.states.push(state)
      atrule.remove()
      accept()
    })
  }

  #processAtRule = (atrule, accept, reject) => {
    switch (atrule.name) {
      case 'selector': return this.#validateSelector(atrule, (err, selector) => {
        if (err) {
          return reject(err)
        }

        this.selector = selector
        atrule.remove()
        accept()
      })

      case 'state':
        this.#substates.push(atrule)
        return accept()

      default: return reject(this.error(`\n${this.#err}\nValid properties include CSS declarations, nested rules, and the following at-rules: ${this.#validAtRules.map(atrule => `@${atrule}`).join(', ')}`))
    }
  }

  #validateSelector = (atrule, cb) => {
    if (!!this.selector) {
      return cb(this.error(`\n${this.#err}\nDuplicate @selector properties`))
    }

    let selectorList = SelectorUtils.clean(atrule.params, true)
    let invalid = selectorList.find(selector => !selector.startsWith('&'))

    if (invalid) {
      return cb(atrule.error(`\n${this.#err}\nSelectors must begin with nesting operators (&)`, { word: invalid }))
    }

    cb(null, selectorList.join(', '))
  }
}

export default class ComponentRule extends Class {
  #validConfigOptions = ['selector', 'reset', 'state']

  name = null
  states = []
  extends = null

  constructor (atrule) {
    super({ root: atrule })
  }

  getState (name) {
    return this.states.find(state => {
      if (state.name === name) {
        return state
      }
    })
  }

  hasState (name) {
    return this.states.some(state => state.name === name)
  }

  validate (cb) {
    super.validate(err => {
      if (err) {
        return cb(err)
      }

      err = `\n'Invalid component configuration.'\nConfiguration must contain only the following at-rules: ${this.#validConfigOptions.join(', ')}`

      let queue = new NGN.Tasks()

      queue.on('complete', cb)

      this.nodes.forEach(node => {
        queue.add(`Validating configuration item`, next => {
          if (node.type !== 'atrule') {
            return cb(node.error(err))
          }

          switch (node.name) {
            case 'selector':
              if (!!this.selector) {
                return cb(this.error(`\n${err}\nDuplicate @selector properties`))
              }

              this.selector = node.params
              break

            case 'reset':
              this.reset = node.params
              break

            case 'state':
              let state = new StateRule(this, node)

              return state.validate(err => {
                if (err) {
                  return cb(err)
                }

                this.states.push(state)
                next()
              })

            default: return cb(node.error(err))
          }

          next()
        })
      })

      queue.run(true)
    })
  }
}

// class State {
//   name = null
//   selector = null
//
//   constructor (parent, atrule) {
//     atrule = atrule.clone()
//     this.name = atrule.params.trim()
//
//     if (/\s/.test(name)) {
//       throw new Error(`Illegal state "${name}"\n       State names must not contain whitespace.`)
//     }
//
//     let decls = []
//     let atrules = []
//
//     atrule.nodes.forEach(node => {
//       switch (node.type) {
//         case 'decl': return decls.push(node)
//         case 'atrule': return atrules.push(node)
//         default: throw new Error(`Invalid node type`)
//       }
//     })
//
//     atrules.forEach(atrule => {
//       switch (atrule.name) {
//         case 'selector':
//           if (!atrule.params.startsWith('&')) {
//             return cb(`State "${name}": @selector must be prefixed with "&"`)
//           }
//
//           selector = atrule.params
//           break;
//         default:
//
//       }
//     })
//   }
// }
//
// export default class Component extends AtRule {
//   #err = ''
//   states = []
//   selector = null
//   extends = null
//
//   #processNodes = (parent, nodes) => {
//     let states = []
//
//     nodes.forEach(node => {
//       if (node.type !== 'atrule') {
//         throw new Error(`${this.#err}Components can only contain @selector, @reset, and @state rules.`)
//       }
//
//       let isBase = parent === this
//
//       switch (node.name) {
//         case 'selector':
//           if (parent.selector) {
//             throw new Error(`${this.#err}Component contains duplicate @selector rules`)
//           }
//
//           let selectorList = SelectorUtils.clean(node.params, true)
//
//           if (isBase && !parent.isExtension && selectorList.some(selector => selector.startsWith('&'))) {
//             throw new Error(`${this.#err}Invalid selector "${node.params}"\n       Base component selectors cannot start with nesting operators.`)
//           }
//
//           parent.selector = selectorList.join(', ')
//           break
//
//         case 'reset':
//           if (isBase && parent.reset) {
//             throw new Error(`${this.#err}Component contains duplicate @reset rules`)
//           }
//
//           parent.reset = node.params
//           break
//
//         case 'state': return parent.states.push(new State(parent, node))
//       }
//
//       if (isBase && !parent.selector) {
//         throw new Error(`${this.#err}@selector rule is required.`)
//       }
//     })
//   }
//
//   constructor (atrule) {
//     super({
//       root: atrule,
//
//       args: [
//         {
//           name: 'component',
//           types: ['word']
//         },
//
//         { types: ['space'] },
//
//         {
//           name: 'extends',
//           types: ['word'],
//           value: 'extends'
//         },
//
//         { types: ['space'] },
//
//         {
//           name: 'parent',
//           types: ['word']
//         }
//       ]
//     })
//
//     let { component, parent } = this.args
//
//     if (!component) {
//       throw new Error(`Invalid component configuration.`)
//     }
//
//     this.name = component.value
//
//     if (!this.name) {
//       throw new Error(`Invalid component name. Component name must be a non-empty string.`)
//     }
//
//     this.#err = `Invalid configuration for component "${this.name}"\n       `
//
//     if (parent) {
//       this.extends = parent.value
//     } else if (this.args.hasOwnProperty('extends')) {
//       throw new Error(`${this.#err}Cannot extend "${NGN.coalesce(this.extends, 'UNKNOWN')}"`)
//     }
//
//     if (this.root.nodes.length === 0) {
//       throw new Error(this.#err)
//     }
//
//     // this.#processNodes(this, this.root.nodes)
//   }
//
//   get isExtension () {
//     return !!this.extends
//   }
//
//   reconcileStates (states) {
//     ComponentUtils.reconcileStates(this.states, states)
//   }
//
//   // addState (state) {
//   //   console.log(state);
//   //
//   //   // ComponentUtils.parseState(atrule, this.isExtension, (err, result) => {
//   //   //   if (err) {
//   //   //     throw new Error(`${this.#err}${err}`)
//   //   //   }
//   //   //
//   //   //   this.states.push(result)
//   //   // })
//   // }
// }
