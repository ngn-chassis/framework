import postcss from 'postcss'
import CSSUtils from '../utilities/CSSUtils.js'

export default postcss.plugin('chassis-charset', charset => {
  return (root, result) => new Promise((resolve, reject) => {
    root.prepend(CSSUtils.createAtRule({
      name: 'charset',
      params: `"${charset}"`
    }))

    resolve(root)
  })
})
