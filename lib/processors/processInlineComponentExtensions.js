import postcss from 'postcss'
import ComponentUtils from '../utilities/ComponentUtils.js'
import SelectorUtils from '../utilities/SelectorUtils.js'
import ErrorUtils from '../utilities/ErrorUtils.js'

function getSelector (rule) {
  return rule.parent ? `${NGN.coalesce(getSelector(rule.parent), '')}${rule.selector}` : rule.selector
}

export default postcss.plugin('inline-component-extensions', stylesheet => (root, result) => new Promise((resolve, reject) => {
  root.walkAtRules('extends', atRule => {
    let component = stylesheet.components.find(component => component.name === atRule.params)

    if (!component) {
      return console.log('THROW ERROR')
    }

    let definition = {
      root: atRule,
      name: NGN.DATA.util.GUID(),
      selector: atRule.parent.selector,
      extends: component.name,
      states: []
    }

    atRule.nodes.forEach(node => {
      if (node.type !== 'atrule') {
        return console.log('THROW ERROR')
      }

      ComponentUtils.parseState(node, true, (err, result) => {
        if (err) {
          return reject(ErrorUtils.createError(Object.assign({}, atRule.source, {
            message: [
              'Invalid component extension',
              err
            ]
          })))
        }

        definition.states.push(result)
      })
    })

    ComponentUtils.reconcileStates(definition.states, component.states)

    let output = postcss.parse(ComponentUtils.processComponent(definition, stylesheet.extensions[component.name]), {
      from: atRule.source.input.file
    })

    definition.selector = SelectorUtils.clean(getSelector(atRule.parent))

    stylesheet.extensions[component.name] = stylesheet.extensions.hasOwnProperty(component.name)
      ? [...stylesheet.extensions[component.name], definition]
      : [definition]

    atRule.parent.replaceWith(output)
  })

  resolve(root)
}))
