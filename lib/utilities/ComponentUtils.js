import postcss from 'postcss'
import CSSUtils from './CSSUtils.js'

export default class ComponentUtils {
  static parseState (atRule, isExtension, cb) {
    atRule = atRule.clone()
    let name = atRule.params.trim()

    if (/\s/.test(name)) {
      return cb(`Illegal state "${name}"\n       State names must not contain whitespace.`)
    }

    let selector = null
    let nodes = null

    atRule.walkAtRules(atRule => {
      switch (atRule.name) {
        case 'selector':
          if (!atRule.params.startsWith('&')) {
            return cb(`State "${name}": @selector must be prefixed with "&"`)
          }

          selector = atRule.params;
          break

        case 'default':
          nodes = atRule.nodes;
          break

        default: return cb(`State "${name}": Illegal property "@${atRule.name}"`)
      }

      atRule.remove()
    })

    if (atRule.nodes.length > 0) {
      if (isExtension) {
        nodes = [...NGN.coalesce(nodes, []), ...atRule.nodes]
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

  static processComponent (component, extensions = []) {
    // let root = component.root.clone()
    // root.removeAll()

    let { selector } = component

    if (extensions.length > 0) {
      selector += `, ${extensions.map(extension => extension.selector).join(', ')}`
    }

    let rule = CSSUtils.createRule(selector)

    component.states.forEach(state => {
      let defaults = NGN.coalesce(state.default, [])

      if (!state.selector) {
        return rule.append(defaults)
      }

      rule.append(CSSUtils.createRule(state.selector, defaults))
    })

    return rule
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
