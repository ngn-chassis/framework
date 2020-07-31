import postcss from 'postcss'

export default postcss.plugin('chassis-atrules-extend', () => {
  return (root, result) => new Promise((resolve, reject) => {
    root.walkAtRules('extend', atrule => {
      console.log(atrule.name)
    })

    resolve(root)
  })
})
