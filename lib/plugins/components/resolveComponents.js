import postcss from 'postcss'
import parser from 'postcss-scss'
import perfectionist from 'perfectionist'

import Config from '../../data/Config.js'
import CSSUtils from '../../utilities/CSSUtils.js'
import QueueUtils from '../../utilities/QueueUtils.js'

import generateComponentResets from './generateComponentResets.js'
import generateComponents from './generateComponents.js'
import generateDisplayRules from './generateDisplayRules.js'

export default postcss.plugin('components', (components, theme) => {
  return (root, result) => new Promise((resolve, reject) => {
    let output = CSSUtils.createRoot()

    let callback = (err, css, next) => {
      if (err) {
        return reject(err)
      }

      output.append(css)
      next()
    }

    QueueUtils.run({
      pad: {
        start: '      '
      },

      tasks: [
        {
          name: `Generating Element/Component Resets`,
          callback: next => generateComponentResets(components, (err, css) => callback(err, css, next))
        }, {
          name: `Generating Component CSS`,
          callback: next => generateComponents(components, theme, (err, css) => callback(err, css, next))
        }//, {
        //   name: 'Generating Element Display Rules',
        //   callback: next => generateDisplayRules(stylesheet.displayRules, (err, css) => callback(err, css, next))
        // }
      ]
    }).then(() => {
      output.append(`/* Custom Styles ***************************************************************/`)

      perfectionist.process(output.toString(), Config.beautify).then(beautified => {
        output = parser.parse(beautified.toString(), { from: void 0 })
        output.source.input.id = `chassis.components`
        root.append(output)

        resolve(root)
      })
    }).catch(reject)
  })
})
