import postcss from 'postcss'

export default postcss.plugin('chassis-resolve-components', (stylesheet, theme) => {
  return (root, result) => new Promise((resolve, reject) => {
    // console.log(stylesheet.components)
    resolve(root)
  })
})
