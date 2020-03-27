import postcss from 'postcss'
import AtRules from '../AtRules.js'
import AtRule from '../AtRule.js'
import ErrorUtils from '../utilities/ErrorUtils.js'

export default postcss.plugin('at-rules', cfg => {
  return root => new Promise((resolve, reject) => {
    root.walkAtRules(atRule => {
      if (!AtRules.hasOwnProperty(atRule.name)) {
        return
      }

      atRule = new AtRule(atRule)
      atRule.resolve(err => err && reject(err))
    })

    resolve(root)
  })
})
