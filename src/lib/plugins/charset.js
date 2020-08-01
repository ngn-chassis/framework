import postcss from 'postcss'
import parser from 'postcss-scss'

import { CONFIG } from '../../index.js'
import CSSUtils from '../utilities/CSSUtils.js'

export default postcss.plugin('chassis-charset', annotations => {
  return (root, result) => new Promise((resolve, reject) => {
    if (!Reflect.has(annotations, 'charset')) {
      return resolve(root)
    }

    const atrule = CSSUtils.createAtRule({
      name: 'charset',
      params: `"${CONFIG.charset}"`
    })

    annotations.charset.replaceWith(parser.parse(atrule, { from: 'chassis.charset' }))
    resolve(root)
  })
})
