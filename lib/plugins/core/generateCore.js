import postcss from 'postcss'
import parser from 'postcss-scss'
import perfectionist from 'perfectionist'

import Config from '../../data/Config.js'
import Constants from '../../data/Constants.js'

import CSSUtils from '../../utilities/CSSUtils.js'
import QueueUtils from '../../utilities/QueueUtils.js'

export default postcss.plugin('generate-core', (stylesheet, theme) => {
  return (root, result) => new Promise((resolve, reject) => {
    let { modules } = stylesheet

    if (!modules.hasOwnProperty('core')) {
      return resolve(root)
    }

    let core = CSSUtils.createRoot()

    let resources = {
      charset: { charset: Config.charset },
      hoist: { nodes: stylesheet.hoistedNodes },
      viewport: { width: 'device-width' },
      reset: { block: Constants.layout.blockElements, theme },
      'custom-properties': { theme },
      'custom-media': { ranges: Config.viewport.ranges },
      modifiers: {},
      constraints: {}
    }

    QueueUtils.run({
      pad: {
        start: '      '
      },

      tasks: Object.keys(resources).reduce((tasks, resource) => {
        let cfg = resources[resource]

        if (modules.core.hasOwnProperty(resource)) {
          tasks.push({
            name: `Resolving ${resource} module`,
            callback: next => {
              core.append(modules.core[resource](cfg))
              next()
            }
          })
        }

        return tasks
      }, [])
    }).then(() => {
      perfectionist.process(core.toString(), Config.beautify).then(result => {
        core = parser.parse(result.toString(), { from: void 0 })
        core.source.input.id = `chassis.core`
        root.prepend(core)

        resolve(root)
      })
    }).catch(reject)
  })
})
