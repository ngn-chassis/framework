import postcss from 'postcss'
import parser from 'postcss-scss'
import perfectionist from 'perfectionist'

import Config from '../../data/Config.js'
import Constants from '../../data/Constants.js'

import TypographyEngine from './TypographyEngine.js'
import generateComponentResets from './generateComponentResets.js'
import generateComponents from './generateComponents.js'
import generateDisplayRules from './generateDisplayRules.js'

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
      'custom-media': { viewports: Config.viewports },
      modifiers: {},
      constraints: {}
    }

    let tasks = Object.keys(resources).reduce((tasks, resource) => {
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

    if (!Config.typography.disabled) {
      tasks.push({
        name: 'Initialize Typography Engine',
        callback: next => {
          TypographyEngine.initialize(stylesheet.typesets, (err, output) => {
            if (err) {
              return reject(err)
            }

            core.append(output)
            next()
          })
        }
      })
    }

    let components = stylesheet.components.collated

    let callback = (err, output, next) => {
      if (err) {
        return reject(err)
      }

      core.append(output)
      next()
    }

    if (Object.keys(components).length > 0) {
      tasks.push({
        name: 'Generating Element/Component Resets',
        callback: next => generateComponentResets(components, (err, output) => callback(err, output, next))
      }, {
        name: `Generating Component CSS`,
        callback: next => generateComponents(components, theme, (err, output) => callback(err, output, next))
      // }, {
      //   name: 'Generating Element Display Rules',
      //   callback: next => generateDisplayRules(stylesheet.displayRules, (err, css) => callback(err, css, next))
      })
    }

    QueueUtils.run({
      pad: {
        start: '      '
      },

      tasks
    }).then(() => {
      core.append(`/* Custom Styles ***************************************************************/`)

      perfectionist.process(core.toString(), Config.beautify).then(result => {
        core = parser.parse(result.toString(), { from: `chassis.core` })
        root.prepend(core)

        resolve(root)
      })
    }).catch(reject)
  })
})
