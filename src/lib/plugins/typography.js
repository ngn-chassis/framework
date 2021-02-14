import postcss from 'postcss'
import parser from 'postcss-scss'

import { CONFIG } from '../../index.js'
import TypographyEngine from '../TypographyEngine.js'
import SetRule from '../atrules/set/SetRule.js'
import CSSUtils from '../utilities/CSSUtils.js'

export default postcss.plugin('chassis-typography', (annotations, theme) => {
  return (root, result) => new Promise((resolve, reject) => {
    if (!Reflect.has(annotations, 'typography')) {
      return resolve(root)
    }

    const typography = new TypographyEngine(theme, CONFIG.viewports)
    const rules = CSSUtils.createRoot()

    rules.append(typography.renderInitialHeadings(true))

    root.walkAtRules('set', atrule => typography.addSetting(new SetRule(atrule)))
    rules.walkAtRules('set', atrule => typography.addSetting(new SetRule(atrule)))

    rules.append(typography.renderInitialSettings())
    rules.append(typography.renderViewports(CSSUtils.createRoot()))

    annotations.typography.replaceWith(parser.parse(rules, { from: 'chassis.typography' }))

    resolve(root)
  })
})
