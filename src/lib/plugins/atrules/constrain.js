import postcss from 'postcss'

export default postcss.plugin('chassis-constrain', () => {
  return (root, result) => new Promise((resolve, reject) => {
    root.walkAtRules('constrain', atrule => {
      console.log('constrain')
      console.log(atrule.toString())
    })

    resolve(root)
  })
})
