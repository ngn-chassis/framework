import CSSUtils from '../../utilities/CSSUtils.js'
import QueueUtils from '../../utilities/QueueUtils.js'

import blockReset from './resets/block.js'
import inlineBlockReset from './resets/inline-block.js'
import inlineReset from './resets/inline.js'

export default function generateComponentResets (components, theme, cb) {
  let root = CSSUtils.createRoot()
  root.append(`/* Element/Component Reset *****************************************************/`)

  let selectors = {
    block: [],
    'inline-block': [],
    inline: []
  }

  QueueUtils.run({
    pad: {
      start: '        '
    },

    tasks: Object.keys(components).reduce((tasks, name) => {
      let component = components[name]

      if (component.isExtension || !component.reset) {
        return tasks
      }

      tasks.push({
        name: `Generating ${component.name} Reset`,
        callback: next => component.resolveSelectorWithExtensions((err, result) => {
          if (err) {
            return cb(err)
          }

          selectors[component.reset].push(result)
          next()
        })
      })

      return tasks
    }, [])
  }).then(() => {
    if (selectors.block.length > 0) {
      root.append(`
        /* Block Elements */

        ${selectors.block.join(', ')} {
          ${blockReset}
        }
      `)
    }

    if (selectors['inline-block'].length > 0) {
      root.append(`
        /* Inline-block Elements */

        ${selectors['inline-block'].join(', ')} {
          ${inlineBlockReset}
        }
      `)
    }

    if (selectors.inline.length > 0) {
      root.append(`
        /* Inline Elements */

        ${selectors.inline.join(', ')} {
          ${inlineReset}
        }
      `)
    }

    cb(null, root)
  }).catch(cb)
}
