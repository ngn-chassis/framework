import postcss from 'postcss'
import parser from 'postcss-scss'
import perfectionist from 'perfectionist'

import Config from '../../data/Config.js'
import TypographyEngine from './TypographyEngine.js'

export default postcss.plugin('typography', typesetRules => {
  return (root, result) => new Promise((resolve, reject) => {
    TypographyEngine.initialize(typesetRules, (err, output) => {
      if (err) {
        return reject(err)
      }

      perfectionist.process(output.toString(), Config.beautify).then(beautified => {
        output = parser.parse(beautified.toString(), { from: void 0 })
        output.source.input.id = `chassis.typography`

        root.append(output)
        resolve(root)
      })
    })
  })
})
