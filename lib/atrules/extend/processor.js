import ExtendRule from './ExtendRule.js'
import ComponentRule from '../component/ComponentRule.js'
import ExtensionComponent from '../component/ExtensionComponent.js'

import CSSUtils from '../../utilities/CSSUtils.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

export default class {
  static process ({ atrule, stylesheet, resolve, reject }) {
    let { components } = stylesheet
    let ext = new ExtendRule(atrule)

    ext.validate(err => {
      if (err) {
        return reject(err)
      }

      let component = new ComponentRule(CSSUtils.createAtRule({
        name: 'component',
        params: `${ext.name} extends ${ext.superclass}`,
        nodes: ext.nodes
      }))

      component.validate(err => {
        if (err) {
          return reject(err)
        }

        let parent = components.find(component => component.name === ext.superclass)

        if (!parent) {
          return reject(ext.error(`\nCannot extend non-existent component "${ext.superclass}"`, { word: ext.superclass }))
        }

        ext = new ExtensionComponent(parent, component, true)
        parent.addExtension(ext)
        stylesheet.components.push(ext)

        SelectorUtils.resolveSelector(atrule.parent, (err, selector) => {
          ext.selector = selector

          let root = CSSUtils.createRoot(ext.styles)

          ext.resolveStates(root, (err, result) => {
            if (err) {
              return reject(err)
            }

            atrule.replaceWith(result.toString())
            resolve()
          })
        })
      })
    })
  }
}
