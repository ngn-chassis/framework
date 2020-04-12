import postcss from 'postcss'
import AtRules from '../AtRules.js'
import AtRule from '../AtRule.js'
import ErrorUtils from '../utilities/ErrorUtils.js'

export default postcss.plugin('at-rules', () => {
  return root => new Promise((resolve, reject) => {
    root.walkAtRules(atRule => {
      if (!AtRules.hasOwnProperty(atRule.name)) {
        // TODO: Check if atrule is native also, and log a warning if not
        return
      }

      atRule = new AtRule(atRule)
      atRule.resolve(err => err && reject(err))
    })

    resolve(root)
  })
})
