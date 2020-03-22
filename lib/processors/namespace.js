const postcss = require('postcss')

module.exports = postcss.plugin('namespace', cfg => root => new Promise((resolve, reject) => {
  let namespaceSelector = selector => {
    if (selector.includes(',')) {
      return selector.split(',').map(chunk => namespaceSelector(chunk.trim())).join(', ')
    }

    if (selector.includes('html')) {
      return `${selector.trim()}.chassis`
    }

    if (selector.includes(':root')) {
      return selector.trim()
    }

    return `.chassis ${selector.trim()}`
  }

  root.walkRules(rule => {
    // Cleanup empty rulesets
    if (rule.nodes.length === 0) {
      rule.remove()
      return
    }

    if (rule.parent && rule.parent.type === 'atrule' && rule.parent.name === 'keyframes') {
      return
    }

    rule.selector = namespaceSelector(rule.selector)
  })

  resolve(root)
}))
