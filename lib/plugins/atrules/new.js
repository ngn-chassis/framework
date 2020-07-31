import postcss from 'postcss'

export default postcss.plugin('chassis-atrules-new', () => {
  return (root, result) => new Promise((resolve, reject) => {
    root.walkAtRules('new', atrule => {
      console.log(atrule.name)
    })

    resolve(root)
  })
})
