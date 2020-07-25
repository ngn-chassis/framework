import postcss from 'postcss'

export default postcss.plugin('chassis-annotate', () => {
  return (root, result) => new Promise((resolve, reject) => {
    root.prepend(`/* Custom Styles ***************************************************************/`)
    resolve(root)
  })
})
