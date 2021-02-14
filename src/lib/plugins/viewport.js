import postcss from 'postcss'
import parser from 'postcss-scss'

export default postcss.plugin('viewport', annotations => {
  return (root, result) => new Promise((resolve, reject) => {
    if (!Reflect.has(annotations, 'viewport')) {
      return resolve(root)
    }

    annotations.viewport.replaceWith(parser.parse(`@viewport {
  width: device-width;
}`, { from: 'chassis.viewport' }))

    resolve(root)
  })
})
