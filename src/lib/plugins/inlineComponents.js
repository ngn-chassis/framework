import postcss from 'postcss'

import { CONFIG } from '../../index.js'
import TypographyEngine from '../TypographyEngine.js'

export default postcss.plugin('chassis-inline-components', theme => {
  return (root, result) => new Promise((resolve, reject) => {
    const typography = new TypographyEngine(theme, CONFIG.viewports)

    root.walkAtRules('extend', atrule => typography.processInlineComponentSettings(atrule))
    root.walkAtRules('new', atrule => typography.processInlineComponentSettings(atrule))

    resolve(root)
  })
})
