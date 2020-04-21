import postcss from 'postcss'
import CoreModule from '../modules/CoreModule.js'

function cleanupRule (rule) {
  if (rule.nodes.length === 0) {
    return rule.remove()
  }
}

export default postcss.plugin('cleanup', (stylesheet, theme) => {
  return (root, result) => new Promise((resolve, reject) => {
    root.walk(node => {
      switch (node.type) {
        case 'rule': return cleanupRule(node)
      }
    })

    resolve(root)
  })
})
