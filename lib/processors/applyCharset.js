import postcss from 'postcss'

export default postcss.plugin('charset', charset => root => new Promise((resolve, reject) => {
  root.prepend(`@charset "${charset}"`)
  resolve(root)
}))
