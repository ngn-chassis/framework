import postcss from 'postcss'
import CSSUtils from './CSSUtils.js'
import SelectorUtils from './SelectorUtils.js'

export default class ComponentUtils {
  static parseState (atrule, isExtension, cb) {
    atrule = atrule.clone()
    let name = atrule.params.trim()

    if (/\s/.test(name)) {
      return cb(`Illegal state "${name}"\n       State names must not contain whitespace.`)
    }

    let selector = null
    let nodes = null

    atrule.walkAtRules(atrule => {
      switch (atrule.name) {
        case 'selector':
          if (!atrule.params.startsWith('&')) {
            return cb(`State "${name}": @selector must be prefixed with "&"`)
          }

          selector = atrule.params;
          break

        case 'default':
          nodes = atrule.nodes;
          break

        default: return cb(`State "${name}": Illegal property "@${atrule.name}"`)
      }

      atrule.remove()
    })

    if (atrule.nodes.length > 0) {
      if (isExtension) {
        nodes = [...NGN.coalesce(nodes, []), ...atrule.nodes]
      } else {
        return cb(`State "${name}": Default styles must be declared inside @default rule.`)
      }
    }

    cb(null, {
      name,
      selector,
      default: nodes
    })
  }

  static getSelectorList (selector, exts, stylesheet, cb) {
    let { components } = stylesheet
    let list = SelectorUtils.clean(selector, true)

    if (!exts) {
      return cb(list)
    }

    let extended = components.find(component => component.name === exts)
    let hasNestedSelector = list.some(chunk => chunk.startsWith('&'))

    if (!extended.isExtension) {
      if (hasNestedSelector) {
        return SelectorUtils.getNestedSelectorList(extended.selector, selector, cb)
      }

      return cb(list)
    }

    this.getSelectorList(extended.selector, extended.extends, stylesheet, parent => {
      if (hasNestedSelector) {
        return SelectorUtils.getNestedSelectorList(parent.join(', '), selector, cb)
      }

      cb(list)
    })
  }

  static appendExtensionSelectors (component, selectorList, stylesheet, cb) {
    let output = []
    let extensions = NGN.coalesce(stylesheet.extensions[component], [])

    if (extensions.length === 0) {
      return cb([])
    }

    let queue = new NGN.Tasks()

    queue.on('complete', () => cb(output.filter(Boolean)))

    extensions.forEach(extension => {
      let { name, selector } = extension

      queue.add(`Appending ${name} extension selectors`, next => {
        let list = SelectorUtils.clean(selector, true)

        SelectorUtils.getNestedSelectorList(selectorList.join(', '), list.join(', '), result => {
          if (result.length > 0) {
            output.push(...result)
          }

          next()
        })
      })

      if (stylesheet.extensions.hasOwnProperty(name) && stylesheet.extensions[name].length > 0) {
        queue.add('Appending child extension selectors', next => {
          this.appendExtensionSelectors(name, output, stylesheet, result => {
            output.push(...result)
            next()
          })
        })
      }
    })

    queue.run(true)
  }

  static async processComponent (component, stylesheet, cb) {
    let queue = new NGN.Tasks()
    let selectorList, rule

    queue.on('complete', () => {
      rule = CSSUtils.createRule(selectorList.join(', '))

      component.states.forEach(state => {
        let defaults = NGN.coalesce(state.default, [])

        if (!state.selector) {
          return rule.append(defaults)
        }

        rule.append(CSSUtils.createRule(state.selector, defaults))
      })

      cb(rule)
    })

    queue.add(`Processing selector`, next => {
      this.getSelectorList(component.selector, component.extends, stylesheet, list => {
        selectorList = list
        next()
      })
    })

    queue.add(`Appending extension selectors`, next => {
      this.appendExtensionSelectors(component.name, selectorList, stylesheet, result => {
        selectorList.push(...result)
        next()
      })
    })

    queue.run(true)
  }

  static reconcileStates (oldStates, newStates) {
    newStates.forEach(state => {
      let existingState = oldStates.find(existingState => state.name === existingState.name)

      if (!existingState) {
        return
      }

      if (!existingState.selector) {
        existingState.selector = state.selector
      }
    })
  }
}
