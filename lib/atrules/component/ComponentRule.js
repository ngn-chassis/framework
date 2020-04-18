import Class from '../Class.js'
// import ComponentUtils from '../utilities/ComponentUtils.js'
// import SelectorUtils from './utilities/SelectorUtils.js'

export default class Component extends Class {
  name = null
  states = []
  extends = null

  constructor (atrule) {
    super({ root: atrule })
  }

  validate (cb) {
    super.validate(err => {
      if (err) {
        return cb(err)
      }

      console.log('VALIDATE COMPONENT STATES')

      cb()
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
