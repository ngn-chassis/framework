import postcss from 'postcss'
import parser from 'postcss-scss'

import { CONFIG } from '../../index.js'
import CSSUtils from '../utilities/CSSUtils.js'
import TypographyUtils from '../utilities/TypographyUtils.js'

export default postcss.plugin('chassis-root', annotations => {
  return (root, result) => new Promise((resolve, reject) => {
    const rules = CSSUtils.createRoot()
    const { baseFontSize } = CONFIG.typography
    const { width } = CONFIG.layout

    rules.append(parser.parse(`:root {
  background: var(--root-bg-color, initial);
  font-size: ${baseFontSize}px;
  line-height: ${TypographyUtils.getOptimalLineHeight(baseFontSize, width.min)}
}

body {
  min-width: ${width.min}px;
  font-family: var(--font-family, initial);
  color: var(--text-color, initial);
}`, { from: 'chassis.root' }))

    annotations.root.replaceWith(rules)
    resolve(root)
  })
})
