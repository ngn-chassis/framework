import postcss from 'postcss'

export default postcss.plugin('name', () => {
  return (root, result) => new Promise((resolve, reject) => {
    resolve(root)
  })
})
