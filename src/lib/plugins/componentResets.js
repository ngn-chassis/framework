import postcss from 'postcss'
import parser from 'postcss-scss'

import CSSUtils from '../utilities/CSSUtils.js'
import QueueUtils from '../utilities/QueueUtils.js'

import blockReset from './resets/block.js'
import inlineBlockReset from './resets/inline-block.js'
import inlineReset from './resets/inline.js'

export default postcss.plugin('chassis-component-resets', (annotations, components) => {
  return (root, result) => new Promise((resolve, reject) => {
    if (!Reflect.has(annotations, 'componentResets')) {
      return resolve(root)
    }

    const resets = CSSUtils.createRoot()
    const selectors = {
      block: [],
      'inline-block': [],
      inline: []
    }

    QueueUtils.run({
      tasks: Object.values(components).reduce((tasks, component) => {
        if (!component.reset) {
          return tasks
        }

        tasks.push({
          name: `|  |  |-- Generating "${component.name}" component reset`,
          callback: next => {
            selectors[component.reset].push(component.selectorWithExtensionsWithMatchingReset)
            next()
          }
        })

        return tasks
      }, [])
    }).then(() => {
      if (selectors.block.length > 0) {
        resets.append(
          CSSUtils.createComment('Block Elements'),
          CSSUtils.createRule(selectors.block.join(', '), blockReset)
        )
      }

      if (selectors['inline-block'].length > 0) {
        resets.append(
          CSSUtils.createComment('Inline-block Elements'),
          CSSUtils.createRule(selectors['inline-block'].join(', '), inlineBlockReset)
        )
      }

      if (selectors.inline.length > 0) {
        resets.append(
          CSSUtils.createComment('Inline Elements'),
          CSSUtils.createRule(selectors.inline.join(', '), inlineReset)
        )
      }

      annotations.componentResets.replaceWith(parser.parse(resets, { from: 'chassis-element-resets' }))
      resolve(root)
    }).catch(reject)
  })
})
