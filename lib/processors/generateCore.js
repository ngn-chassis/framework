import postcss from 'postcss'
import perfectionist from 'perfectionist'

import Config from '../data/Config.js'
import Constants from '../data/Constants.js'

import ComponentUtils from '../utilities/ComponentUtils.js'
import CSSUtils from '../utilities/CSSUtils.js'
import QueueUtils from '../utilities/QueueUtils.js'
import TypographyUtils from '../utilities/TypographyUtils.js'

export default postcss.plugin('generate-core', (stylesheet, theme) => {
  return (root, result) => new Promise((resolve, reject) => {
    let { components, modules } = stylesheet

    if (!modules.hasOwnProperty('core')) {
      return resolve(root)
    }

    components = components.collated
    let core = CSSUtils.createRoot()

    let resources = {
      charset: { charset: Config.charset },
      viewport: { width: 'device-width' },
      reset: { block: Constants.layout.blockElements },
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
          callback: next => modules.core[resource](cfg, (err, css) => {
            if (err) {
              return reject(err)
            }

            core.append(css)
            next()
          })
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
          })
          .then(() => {
            core.append(root)
            next()
          })
          .catch(reject)
        }
      })
    }

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
          callback: next => ComponentUtils.generateResets(components, (err, css) => callback(err, css, next))
        }, {
          name: `Generating Component CSS`,
          callback: next => ComponentUtils.generateCSS(components, (err, css) => callback(err, css, next))
        }
      ]
    })
    .then(() => {
      core.append('/* Custom Styles ***************************************************************/')

      perfectionist.process(core.toString(), Config.beautify).then(result => {
        core = postcss.parse(result.toString(), { from: void 0 })
        core.source.input.id = `chassis.core`
        root.prepend(core)

        resolve(root)
      })
    })
    .catch(reject)
  })
})
