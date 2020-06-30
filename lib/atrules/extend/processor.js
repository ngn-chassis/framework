import ExtendRule from './ExtendRule.js'
import ComponentRule from '../component/ComponentRule.js'
import Component from '../component/Component.js'

import CSSUtils from '../../utilities/CSSUtils.js'
import QueueUtils from '../../utilities/QueueUtils.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

export default class {
  static process ({ atrule, stylesheet, theme }, resolve, reject) {
    let { components } = stylesheet
    let ext = new ExtendRule(atrule)

    components = components.data
    let parent = components[ext.superclass]

    if (!parent) {
      return reject(ext.error(`\nCannot extend non-existent component "${ext.superclass}"`, { word: ext.superclass }))
    }

    let chain = SelectorUtils.getLineage(atrule.parent)
    // let useGlobals = !chain.some(parent => parent.type === 'atrule') // TODO: Check if parent has reset and factor that in

    ext = new Component(new ComponentRule(CSSUtils.createAtRule({
      name: 'component',
      params: `${ext.name} extends ${ext.superclass}`,
      nodes: ext.nodes
    })), true)

    ext.parent = parent
    let tasks = []

    // if (useGlobals) {
      tasks.push({
        name: `Resolve extension selector`,
        callback: next => SelectorUtils.resolve(chain, (err, result) => {
          if (err) {
            return reject(err)
          }

          ext.selector = result
          next()
        })
      })
    // }

    QueueUtils.run({
      log: false,
      tasks
    }).then(() => {
      stylesheet.components.add(ext)

      ext.resolve(theme, (err, result) => {
        // if (!useGlobals) {
        //   console.log('TODO: Add Local Reset')
        //   // result.nodes.unshift(/* Get Reset */)
        // }

        parent.addExtension(ext)
        atrule.replaceWith(result.nodes)
        resolve()
      })
    }).catch(reject)
  }
}
