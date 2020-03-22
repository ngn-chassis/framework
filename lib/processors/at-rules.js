const postcss = require('postcss')
const AtRule = require('../Mixin.js')
const ErrorUtils = require('../utilities/ErrorUtils.js')

let native = [
  'charset',
  'namespace',
  'media',
  'supports',
  'document',
  'page',
  'font-face',
  'keyframes',
  'viewport',
  'counter-style',
  'font-feature-values',
  'swash',
  'ornaments',
  'annotation',
  'stylistic',
  'styleset',
  'character-variant'
]

let chassis = [
  'component',
  'export',
  'function',
  'import',
  'interface',
  'mixin',
  'theme',
  'selector',
  'state'
]

module.exports = postcss.plugin('at-rules', cfg => {
  return root => new Promise((resolve, reject) => {
    root.walkAtRules(atRule => {
      if ([...native, ...chassis].includes(atRule.name)) {
        return
      }

      atRule = new AtRule(atRule)

      if (!atRule.isValid) {
        return reject(ErrorUtils.createError(Object.assign({}, atRule.source, {
          message: `Invalid @rule "${atRule.name}"`
        })))
      }

      atRule.resolve()
    })

    resolve(root)
  })
})
