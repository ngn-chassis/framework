import NewRule from './NewRule.js'
import ComponentRule from '../component/ComponentRule.js'
import Component from '../component/Component.js'

import CSSUtils from '../../utilities/CSSUtils.js'
import ComponentUtils from '../../utilities/ComponentUtils.js'
import QueueUtils from '../../utilities/QueueUtils.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

export default class {
  static process ({ atrule, stylesheet, theme }, resolve, reject) {
    let components = stylesheet.components.data
    let rule = new NewRule(atrule)
    let component = components[rule.component]

    if (!component) {
      return reject(atrule.error(`\nCannot generate a new instance of non-existent component "${implement.component}"`, { word: implement.component }))
    }

    SelectorUtils.resolve(SelectorUtils.getLineage(atrule.parent), (err, result) => {
      component = new Component(ComponentUtils.createComponent(component.raw))
      component.selector = result
      component.name = rule.name

      stylesheet.components.add(component)

      let implementation = new Component(new ComponentRule(CSSUtils.createAtRule({
        name: 'component',
        params: rule.name,
        nodes: rule.nodes
      })), true)

      implementation.parent = component

      implementation.resolve(theme, (err, result) => {
        atrule.replaceWith(result.nodes)
        resolve()
      })
    })
  }
}
