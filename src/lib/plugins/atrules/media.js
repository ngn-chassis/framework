import postcss from 'postcss'

import MediaQueryRule from '../../atrules/media/MediaQueryRule.js'
import CSSUtils from '../../utilities/CSSUtils.js'

export default postcss.plugin('chassis-atrules-media', () => {
  return (root, result) => new Promise((resolve, reject) => {
    root.walkAtRules('media', atrule => {
      let query = new MediaQueryRule(atrule)
      let { parent } = atrule

      let replacement = CSSUtils.createAtRule({
        name: 'media',
        params: query.params,
        nodes: atrule.nodes
      })

      atrule.replaceWith(replacement)
      replacement.parent = parent
    })

    resolve(root)
  })
})
