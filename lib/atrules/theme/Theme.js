// import nesting from 'postcss-nesting'
// import ApplyRule from '../apply/ApplyRule.js'
// import Application from '../apply/Application.js'
// import QueueUtils from '../../utilities/QueueUtils.js'
import Class from '../Class.js'
import StateRule from '../state/StateRule.js'

export default class Theme extends Class {
  #source
  #components
  #headings
  #properties

  constructor (themeRule) {
    super(themeRule)
    this.#source = themeRule

    this.#components = this.#source.components?.nodes.reduce((components, component) => {
      let states = []
      let decls = component.nodes.filter(node => {
        if (node.type === 'atrule' && node.name === 'state') {
          states.push(new StateRule(node))
          return false
        }

        return true
      })

      components[component.selector.trim()] = { decls, states }
      return components
    }, {}) ?? {}

    this.#headings = this.#source.headings?.nodes.reduce((headings, heading) => {
      let { selector, nodes } = heading

      if (selector.includes(',')) {
        selector.split(',').forEach(part => this.#updateHeadingConfig(headings, part, nodes))
      } else {
        this.#updateHeadingConfig(headings, selector, nodes)
      }

      return headings
    }, {}) ?? {}

    this.#properties = this.#source.properties?.nodes.reduce((properties, property) => {
      properties[property.prop.replace('--', '')] = property.value
      return properties
    }, {}) ?? {}
  }

  get components () {
    return this.#components
  }

  get headings () {
    return this.#headings
  }

  get properties () {
    return this.#properties
  }

  getHeading (name) {
    return this.#headings[name]
  }

  toJson () {
    return this.toJSON()
  }

  toJSON () {
    return {
      properties: this.#properties,
      headings: this.#headings,
      components: this.#components
    }
  }

  toString () {
    return this.#source.toString()
  }

  #updateHeadingConfig = (headings, selector, nodes) => {
    selector = selector.trim()
    nodes = nodes.map(node => node.clone())

    if (headings.hasOwnProperty(selector)) {
      return headings[selector].push(nodes)
    }

    headings[selector] = nodes
  }
}

// export default class Theme {
//   #root = null
//   #components = []
//   #headings = []
//   #sharedHeadingStyles = []
//
//   constructor (rule) {
//     this.#root = rule.root
//     this.#headings = NGN.coalesce(rule.headings, [])
//     this.#components = rule.components
//     this.#sharedHeadingStyles = rule.sharedHeadingStyles
//
//     this.name = rule.args.name.value
//     this.properties = rule.properties
//   }
//
//   get components () {
//     return this.#components
//   }
//
//   get css () {
//     return this.#root.toString()
//   }
//
//   get headings () {
//     return this.#headings
//   }
//
//   get sharedHeadingStyles () {
//     return this.#sharedHeadingStyles
//   }
//
//   get json () {
//     return {
//       name: this.name,
//       properties: this.properties,
//       headings: this.headings,
//       components: this.components,
//       css: this.css
//     }
//   }
//
//   getApplications (components, cb) {
//     // this.#resolveComponentSelectors(components, () => {
//     //
//     // }, cb)
//
//     let applications = []
//     let tasks = []
//
//     this.#root.walkAtRules('apply', atrule => {
//       tasks.push({
//         name: 'Processing @apply rule',
//         callback: next => {
//           let rule = new ApplyRule(atrule)
//
//           rule.validate(components, err => {
//             if (err) {
//               return cb(err)
//             }
//
//             applications.push(new Application(rule))
//             atrule.remove()
//             next()
//           })
//         }
//       })
//     })
//
//     QueueUtils.run({
//       log: false,
//       tasks
//     })
//     .then(() => cb(null, applications))
//     .catch(cb)
//   }
//
//   #resolveComponentSelectors = (components, resolve, reject) => {
//     // Object.values(components).forEach(component => console.log(component.states))
//
//     QueueUtils.run({
//       log: false,
//
//       tasks: this.components.reduce((tasks, component) => {
//         let match = components[component.name]
//
//         if (!match) {
//           return tasks
//         }
//
//         tasks.push({
//           name: `Update "${component.name}" component theme selector`,
//           callback: next => {
//             match.resolveSelectorWithExtensions((err, result) => {
//               component.root.selector = result
//               next()
//             })
//           }
//         })
//
//         return tasks
//       }, [])
//     })
//     .then(resolve)
//     .catch(reject)
//   }
// }
