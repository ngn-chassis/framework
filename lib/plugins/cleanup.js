import postcss from 'postcss'

export default postcss.plugin('chassis-cleanup', (stylesheet, theme) => {
  return (root, result) => new Promise((resolve, reject) => {
    root.walk(node => {
      if (node.hasOwnProperty('nodes') && node.nodes.length === 0) {
        return node.remove()
      }
    })

    resolve(root)
  })
})
