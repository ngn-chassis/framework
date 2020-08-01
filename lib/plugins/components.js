import postcss from 'postcss'
import parser from 'postcss-scss'

import InlineComponent from '../atrules/InlineComponent.js'
import CSSUtils from '../utilities/CSSUtils.js'
import QueueUtils from '../utilities/QueueUtils.js'

export default postcss.plugin('chassis-components', (annotations, components, themes) => {
  return (root, result) => new Promise((resolve, reject) => {
    if (!annotations.hasOwnProperty('components')) {
      return resolve(root)
    }

    let componentsArray = Object.values(components)
    let rules = CSSUtils.createRoot()

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
            let rule = CSSUtils.createRule(component.selectorWithExtensions)
            rule.append(component.decls)

            let theme = themes[component.name]

            if (!!theme) {
              rule.append(theme.decls)
            }

            component.states.forEach(state => {
              let stateRule = CSSUtils.createRule(state.selector)

              stateRule.append(state.decls)

              if (theme) {
                let themeState = theme.states.find(themeState => themeState.name === state.name)

                if (!!themeState) {
                  stateRule.append(themeState.decls)
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
