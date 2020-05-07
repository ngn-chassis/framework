import postcss from 'postcss'
import parser from 'postcss-scss'
import perfectionist from 'perfectionist'

import Config from '../../data/Config.js'
import Constants from '../../data/Constants.js'

import generateComponentResets from './generateComponentResets.js'
import generateComponents from './generateComponents.js'

import ComponentUtils from '../../utilities/ComponentUtils.js'
import CSSUtils from '../../utilities/CSSUtils.js'
import QueueUtils from '../../utilities/QueueUtils.js'
import TypographyUtils from '../../utilities/TypographyUtils.js'

export default postcss.plugin('generate-core', (stylesheet, theme) => {
  return (root, result) => new Promise((resolve, reject) => {
    let { components, modules } = stylesheet

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
        name: `Initializing Typography Engine`,
        callback: next => {
          let root = CSSUtils.createRoot([])

          let callback = (err, css, next) => {
            if (err) {
              return reject(err)
            }

            root.append(css)
            next()
          }

          QueueUtils.run({
            log: false,

            pad: {
              start: '        '
            },

            tasks: [
              {
                name: `Generating Initial Typeset`,
                callback: next => TypographyUtils.generateInitialTypeset((err, css) => callback(err, css, next))
              },

              {
                name: `Generating Viewport Width Range Typesets`,
                callback: next => TypographyUtils.generateRanges((err, css) => callback(err, css, next))
              },

              {
                name: `Generating Last Viewport Width Range Typeset`,
                callback: next => TypographyUtils.generateLastRangeTypeset((err, css) => callback(err, css, next))
              }
            ]
          }).then(() => {
            core.append(root)
            next()
          }).catch(reject)
        }
      })
    }

    components = components.collated

    let callback = (err, css, next) => {
      if (err) {
        return reject(err)
      }

      core.append(css)
      next()
    }

    QueueUtils.run({
      pad: {
        start: '      '
      },

      tasks: [
        ...tasks,

        {
          name: `Generating Element/Component Resets`,
          callback: next => generateComponentResets(components, theme, (err, css) => callback(err, css, next))
        }, {
          name: `Generating Component CSS`,
          callback: next => generateComponents(components, theme, (err, css) => callback(err, css, next))
        }
      ]
    }).then(() => {
      core.append('/* Custom Styles ***************************************************************/')

      perfectionist.process(core.toString(), Config.beautify).then(result => {
        core = parser.parse(result.toString(), { from: void 0 })
        core.source.input.id = `chassis.core`
        root.prepend(core)

        resolve(root)
      })
    }).catch(reject)
  })
})
