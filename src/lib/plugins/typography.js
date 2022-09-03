import postcss from 'postcss'
import parser from 'postcss-scss'
import SetRule from '../atrules/set/SetRule.js'
import CSSUtils from '../utilities/CSSUtils.js'

export default postcss.plugin('chassis-typography', (annotations, engine) => {
  return (root, result) => new Promise((resolve, reject) => {
    if (!Reflect.has(annotations, 'typography')) {
      return resolve(root)
    }

    const rules = CSSUtils.createRoot()

    rules.append(engine.renderInitialHeadings(true))

    root.walkAtRules('set', atrule => engine.addSetting(new SetRule(atrule)))
    rules.walkAtRules('set', atrule => engine.addSetting(new SetRule(atrule)))

    rules.append(engine.renderInitialSettings())
    rules.append(engine.renderViewports(CSSUtils.createRoot()))

    annotations.typography.replaceWith(parser.parse(rules, { from: 'chassis.typography' }))

    resolve(root)
  })
})
