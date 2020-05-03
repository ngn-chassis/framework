import postcss from 'postcss'
import nesting from 'postcss-nesting'
import CSSUtils from './CSSUtils.js'
import QueueUtils from './QueueUtils.js'
import SelectorUtils from './SelectorUtils.js'

import ComponentRule from '../atrules/component/ComponentRule.js'

export default class ComponentUtils {
  static createComponent (definition) {
    return new ComponentRule(postcss.parse(definition, { from: 'chassis.components' }).nodes[0])
  }

  static #getChain = (components, component) => {
    if (!component.isExtension) {
      return []
    }

    let parent = components[component.superclass]

    if (!parent.isExtension) {
      return [parent]
    }

    return [parent, ...this.#getChain(components, parent)]
  }

  // static generateCSS (components, cb) {
  //   let root = CSSUtils.createRoot()
  //   root.append(`/* Components ******************************************************************/`)
  //
  //   QueueUtils.run({
  //     pad: {
  //       start: '        '
  //     },
  //
  //     tasks: Object.keys(components).reduce((tasks, name) => {
  //       let component = components[name]
  //
  //       if (component.inline) {
  //         return tasks
  //       }
  //
  //       tasks.push({
  //         name: `Generating ${component.name} CSS`,
  //         callback: next => this.#resolveSelectorList(component, (err, selector) => {
  //           console.log(selector);
  //           if (err) {
  //             return cb(err)
  //           }
  //
  //           // root.append(`/* ${component.name} */`)
  //           let rule = CSSUtils.createRule(selector)
  //           rule.append(component.styles)
  //
  //           if (component.states.length === 0) {
  //             return next()
  //           }
  //
  //           this.#resolveStates(component.isExtension ? this.#getChain(components, component) : null, component, (err, css) => {
  //             if (err) {
  //               return cb(err)
  //             }
  //
  //             rule.append(css)
  //             root.append(rule)
  //
  //             if (component.extensions.length === 0) {
  //               return next()
  //             }
  //
  //             this.#generateExtensions(component.isExtension ? [...this.#getChain(components, component), component] : [component], component.extensions, (err, css) => {
  //               if (err) {
  //                 return cb(err)
  //               }
  //
  //               root.append(css)
  //               next()
  //             })
  //           })
  //         })
  //       })
  //
  //       return tasks
  //     }, [])
  //   })
  //   .then(() => cb(null, root))
  //   .catch(cb)
  // }

  // static #resolveExtensionsSelectorList = (rule, extensions, cb) => {
  //   let append = []
  //
  //   QueueUtils.run({
  //     log: false,
  //
  //     tasks: extensions.map(extension => ({
  //       name: 'Resolving Extension Selector',
  //       callback: next => this.#resolveSelectorList(extension, (err, result) => {
  //         let parts = SelectorUtils.parse(result)
  //
  //         if (parts.nested.length > 0) {
  //           rule.append(CSSUtils.createRule(parts.nested.join(', ')))
  //         }
  //
  //         append.push(...parts.standalone)
  //         next()
  //       })
  //     }))
  //   }).then(() => SelectorUtils.getNestedSelectorList(rule, (err, result) => {
  //     err ? cb(err) : cb(null, `${result}, ${append.join(', ')}`)
  //   })).catch(cb)
  // }

  // static #resolveSelectorList = (component, cb) => {
  //   let { selector } = component
  //
  //   if (!component.hasExtensions || component.inline) {
  //     return cb(null, selector)
  //   }
  //
  //   let rule = CSSUtils.createRule(selector)
  //   let list = [selector]
  //
  //   this.#resolveExtensionsSelectorList(rule, component.extensions, (err, result) => {
  //     if (err) {
  //       return cb(err)
  //     }
  //
  //     cb(null, [...list, result].join(', '))
  //   })
  // }

  static #resolveState = (chain, state, cb) => {
    let { selector } = state

    if (!selector) {
      let parentState
      let parent = chain.reverse().find(component => {
        if (!component.hasState(state.name)) {
          return false
        }

        parentState = component.getState(state.name)

        if (!!parentState.selector) {
          return true
        }
      })

      if (!parent) {
        return cb(state.error(`\nState "${state.name}" requires an @selector property`))
      }

      selector = parentState.selector
    }

    let rule = CSSUtils.createRule(selector)
    rule.append(state.styles)

    if (!state.hasStates) {
      return cb(null, rule)
    }

    console.log('TODO: Process nested states');
  }

  static #resolveStates = (chain, parent, cb) => {
    let root = CSSUtils.createRoot()

    QueueUtils.run({
      log: false,

      pad: {
        start: '          '
      },

      tasks: parent.states.map(state => ({
        name: `Resolving ${state.name} state`,
        callback: next => this.#resolveState(chain, state, (err, result) => {
          if (err) {
            return cb(err)
          }

          root.append(result)
          next()
        })
      }))
    })
    .then(() => cb(null, root))
    .catch(cb)
  }

  static #generateExtensionCSS = (chain, extension, cb) => {
    let root = CSSUtils.createRoot()
    let previous = root

    chain.forEach(component => {
      let selector = component.selector

      if (component.isExtension) {
        let parts = SelectorUtils.parse(component.selector)
        selector = parts.nested.join(', ')
      }

      let rule = CSSUtils.createRule(selector)
      previous.append(rule)
      previous = rule
    })

    let parts = SelectorUtils.parse(extension.selector)
    let rule = CSSUtils.createRule(parts.nested.join(', '))
    let hasStandaloneSelectors = parts.standalone.length > 0

    QueueUtils.run({
      log: false,

      tasks: [{
        name: 'Resolve Extension CSS',
        callback: next => {
          if (!hasStandaloneSelectors) {
            return next()
          }

          let parent = previous.clone()
          parent.append(rule)

          nesting.process(parent, { from: void 0 }).then(result => {
            rule = result.root.nodes[0]
            rule.selector += `, ${parts.standalone.join(', ')}`
            next()
          })
        }
      }]
    })
    .then(() => {
      rule.append(extension.styles)

      if (hasStandaloneSelectors) {
        previous.replaceWith(rule)
        previous = rule
      } else {
        previous.append(rule)
      }

      if (!extension.hasStates) {
        return cb(null, previous)
      }

      this.#resolveStates(chain, extension, (err, css) => {
        if (err) {
          return cb(err)
        }

        if (hasStandaloneSelectors) {
          previous.append(css)
        } else {
          rule.append(css)
          previous.append(rule)
        }

        cb(null, root)
      })
    }).catch(cb)
  }

  static #generateExtensions = (chain, extensions, cb) => {
    let root = CSSUtils.createRoot()

    QueueUtils.run({
      log: false,

      pad: {
        start: '          '
      },

      tasks: extensions.map(extension => ({
        name: `Generating ${extension.name} extension`,
        callback: next => this.#generateExtensionCSS(chain, extension, (err, css) => {
          if (err) {
            return cb(err)
          }

          root.append(css)

          if (!extension.hasExtensions) {
            return next()
          }

          this.#generateExtensions([...chain, extension], extension.extensions, (err, css) => {
            if (err) {
              return cb(err)
            }

            root.append(css)
            next()
          })
        })
      }))
    })
    .then(() => cb(null, root))
    .catch(cb)
  }

  // static parseState (atrule, isExtension, cb) {
  //   atrule = atrule.clone()
  //   let name = atrule.params.trim()
  //
  //   if (/\s/.test(name)) {
  //     return cb(`Illegal state "${name}"\n       State names must not contain whitespace.`)
  //   }
  //
  //   let selector = null
  //   let nodes = null
  //
  //   atrule.walkAtRules(atrule => {
  //     switch (atrule.name) {
  //       case 'selector':
  //         if (!atrule.params.startsWith('&')) {
  //           return cb(`State "${name}": @selector must be prefixed with "&"`)
  //         }
  //
  //         selector = atrule.params;
  //         break
  //
  //       case 'default':
  //         nodes = atrule.nodes;
  //         break
  //
  //       default: return cb(`State "${name}": Illegal property "@${atrule.name}"`)
  //     }
  //
  //     atrule.remove()
  //   })
  //
  //   if (atrule.nodes.length > 0) {
  //     if (isExtension) {
  //       nodes = [...NGN.coalesce(nodes, []), ...atrule.nodes]
  //     } else {
  //       return cb(`State "${name}": Default styles must be declared inside @default rule.`)
  //     }
  //   }
  //
  //   cb(null, {
  //     name,
  //     selector,
  //     default: nodes
  //   })
  // }
  //
  // static getSelectorList (selector, exts, stylesheet, cb) {
  //   let { components } = stylesheet
  //   let list = SelectorUtils.clean(selector, true)
  //
  //   if (!exts) {
  //     return cb(list)
  //   }
  //
  //   let extended = components.find(component => component.name === exts)
  //   let hasNestedSelector = list.some(chunk => chunk.startsWith('&'))
  //
  //   if (!extended.isExtension) {
  //     if (hasNestedSelector) {
  //       return SelectorUtils.getNestedSelectorList(extended.selector, selector, cb)
  //     }
  //
  //     return cb(list)
  //   }
  //
  //   this.getSelectorList(extended.selector, extended.superclass, stylesheet, parent => {
  //     if (hasNestedSelector) {
  //       return SelectorUtils.getNestedSelectorList(parent.join(', '), selector, cb)
  //     }
  //
  //     cb(list)
  //   })
  // }
  //
  // static appendExtensionSelectors (component, selectorList, stylesheet, cb) {
  //   let output = []
  //   let extensions = NGN.coalesce(stylesheet.extensions[component], [])
  //
  //   if (extensions.length === 0) {
  //     return cb([])
  //   }
  //
  //   let queue = new NGN.Tasks()
  //
  //   queue.on('complete', () => cb(output.filter(Boolean)))
  //
  //   extensions.forEach(extension => {
  //     let { name, selector } = extension
  //
  //     queue.add(`Appending ${name} extension selectors`, next => {
  //       let list = SelectorUtils.clean(selector, true)
  //
  //       SelectorUtils.getNestedSelectorList(selectorList.join(', '), list.join(', '), result => {
  //         if (result.length > 0) {
  //           output.push(...result)
  //         }
  //
  //         next()
  //       })
  //     })
  //
  //     if (stylesheet.extensions.hasOwnProperty(name) && stylesheet.extensions[name].length > 0) {
  //       queue.add('Appending child extension selectors', next => {
  //         this.appendExtensionSelectors(name, output, stylesheet, result => {
  //           output.push(...result)
  //           next()
  //         })
  //       })
  //     }
  //   })
  //
  //   queue.run(true)
  // }
  //
  // static async processComponent (component, stylesheet, cb) {
  //   let queue = new NGN.Tasks()
  //   let selectorList, rule
  //
  //   queue.on('complete', () => {
  //     rule = CSSUtils.createRule(selectorList.join(', '))
  //
  //     component.states.forEach(state => {
  //       let defaults = NGN.coalesce(state.default, [])
  //
  //       if (!state.selector) {
  //         return rule.append(defaults)
  //       }
  //
  //       rule.append(CSSUtils.createRule(state.selector, defaults))
  //     })
  //
  //     cb(rule)
  //   })
  //
  //   queue.add(`Processing selector`, next => {
  //     this.getSelectorList(component.selector, component.superclass, stylesheet, list => {
  //       selectorList = list
  //       next()
  //     })
  //   })
  //
  //   queue.add(`Appending extension selectors`, next => {
  //     this.appendExtensionSelectors(component.name, selectorList, stylesheet, result => {
  //       selectorList.push(...result)
  //       next()
  //     })
  //   })
  //
  //   queue.run(true)
  // }
  //
  // static reconcileStates (oldStates, newStates) {
  //   newStates.forEach(state => {
  //     let existingState = oldStates.find(existingState => state.name === existingState.name)
  //
  //     if (!existingState) {
  //       return
  //     }
  //
  //     if (!existingState.selector) {
  //       existingState.selector = state.selector
  //     }
  //   })
  // }
}
