import postcss from 'postcss'
import parser from 'postcss-scss'

import InlineComponent from '../atrules/InlineComponent.js'
import CSSUtils from '../utilities/CSSUtils.js'
import QueueUtils from '../utilities/QueueUtils.js'

export default postcss.plugin('chassis-components', (annotations, components, themes) => {
  return (root, result) => new Promise((resolve, reject) => {
    if (!Reflect.has(annotations, 'components')) {
      return resolve(root)
    }

    const componentsArray = Object.values(components)
    const rules = CSSUtils.createRoot()

    if (componentsArray.length === 0) {
      return resolve(root)
    }

    QueueUtils.run({
      tasks: componentsArray.reduce((tasks, component) => {
        if (component instanceof InlineComponent) {
          return tasks
        }

        tasks.push({
          name: `|  |  |-- Generating "${component.name}" component CSS`,
          callback: next => {
            const rule = CSSUtils.createRule(component.selectorWithExtensions)
            rule.append(component.nodes)

            const theme = themes[component.name]

            if (theme) {
              rule.append(theme.nodes)
            }

            component.states.forEach(state => {
              const stateRule = CSSUtils.createRule(state.selector)

              stateRule.append(state.nodes)

              if (theme) {
                const themeState = theme.states.find(themeState => themeState.name === state.name)

                if (themeState) {
                  stateRule.append(themeState.nodes)
                }
              }

              rule.append(stateRule)
            })

            rules.append(rule)
            next()
          }
        })

        return tasks
      }, [])
    }).then(() => {
      annotations.components.replaceWith(parser.parse(rules, { from: 'chassis.components' }))
      resolve(root)
    }).catch(reject)
  })
})
