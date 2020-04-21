import postcss from 'postcss'
import CoreModule from '../modules/CoreModule.js'

export default postcss.plugin('resolve-core', (stylesheet, theme) => {
  return (root, result) => new Promise((resolve, reject) => {
    CoreModule.render(stylesheet, theme, (err, css) => {
      if (err) {
        return reject(err)
      }

      root.prepend(css)
      resolve(root)
    })
  })
})
