import nesting from 'postcss-nesting'

import Class from '../Class.js'
import StateRule from './StateRule.js'

import CSSUtils from '../../utilities/CSSUtils.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'
// import QueueUtils from '../../utilities/QueueUtils.js'

export default class State extends Class {
  #source

  constructor (source, parent) {
    super(...arguments)
    this.#source = source
  }

  get selector () {
    if (!this.#source.selector) {
      console.log('STATE: ', this.name)
      console.log('MAY NEED TO GET SUPERCLASS STATE SELECTOR');
      return
    }

    console.log('COMPONENT: ', this)

    let parts = SelectorUtils.parse(this.#source.selector)

    if (!this.parent) {
      return [...parts.nested, ...parts.standalone].join(', ')
    }

    let rule = CSSUtils.createRule(this.parent.selector)
    rule.nodes.push(CSSUtils.createRule(parts.nested.join(', ')))

    return [nesting.process(rule, { from: void 0 }).root.nodes[0].selector, ...parts.standalone].join(', ')
  }

  get states () {
    return this.#source.states.map(stateRule => new State(stateRule, this))
  }
}

// TODO: Automatically reorder states
// Put selectors with pseudo-classes in them at the bottom.
// Check for hover, active, visited, and place them in the proper order

// export default class State extends Class {
//   #raw = null
//   #states = []
//   selector = null
//   styles = []
//   lineage = []
//   parent = null
//
//   constructor (cfg) {
//     super(cfg)
//
//     this.selector = cfg.selector
//     this.styles = cfg.styles
//     this.#states = cfg.states.map(rule => new State(rule))
//     this.#raw = cfg.raw
//     // TODO: Sort states
//     // this.states = cfg.states.map(state => new State(state))
//   }
//
//   get raw () {
//     return this.#raw
//   }
//
//   get states () {
//     return this.#states
//   }
//
//   get hasStates () {
//     return this.#states.length > 0
//   }
//
//   get hasStyles () {
//     return this.styles.length > 0
//   }
//
//   getState (name) {
//     return this.states.find(state => state.name === name)
//   }
//
//   hasState (name) {
//     return this.states.some(state => state.name === name)
//   }
//
//   resolve (component, theme, cb) {
//     let rule
//
//     theme = (theme && theme.states.length > 0)
//       ? theme.states.find(state => state.name === this.name)
//       : null
//
//     QueueUtils.run({
//       log: false,
//
//       tasks: [{
//         name: `Generating State Rule`,
//         callback: next => {
//           let selector = NGN.coalesce(this.selector, component.getStateSelector(this.name))
//
//           if (!selector) {
//             return cb(this.error(`\nState "${this.name}" requires @selector attribute`))
//           }
//
//           rule = CSSUtils.createRule(selector)
//           next()
//         }
//       }, {
//         name: 'Generating State Styles',
//         callback: next => {
//           rule.append(this.styles)
//
//           if (theme) {
//             rule.append(theme.nodes)
//           }
//
//           // TODO: Handle child states
//
//           next()
//         }
//       }]
//     })
//     .then(() => cb(null, rule))
//     .catch(cb)
//   }
// }
