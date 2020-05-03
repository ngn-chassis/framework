import ExtendRule from './ExtendRule.js'
import ComponentRule from '../component/ComponentRule.js'
import Component from '../component/Component.js'

import CSSUtils from '../../utilities/CSSUtils.js'
import QueueUtils from '../../utilities/QueueUtils.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

export default class {
  static #getChain = node => {
    let chain = []

    if (node.type !== 'root') {
      chain.push(node)
    }

    if (!node.parent) {
      return chain
    }

    return [...chain, ...this.#getChain(node.parent)]
  }

  static process ({ atrule, stylesheet, resolve, reject }) {
    let { components } = stylesheet
    let ext = new ExtendRule(atrule)

    components = components.data
    let parent = components[ext.superclass]

    if (!parent) {
      return reject(ext.error(`\nCannot extend non-existent component "${ext.superclass}"`, { word: ext.superclass }))
    }

    let chain = this.#getChain(atrule.parent).reverse()
    let useGlobalReset = !chain.some(parent => parent.type === 'atrule')
    let tasks = []

    ext = new Component(new ComponentRule(CSSUtils.createAtRule({
      name: 'component',
      params: `${ext.name} extends ${ext.superclass}`,
      nodes: ext.nodes
    })), true)

    if (useGlobalReset) {
      tasks.push({
        name: `Resolve extension selector`,
        callback: next => SelectorUtils.resolve(chain, (err, result) => {
          ext.selector = result
          parent.addExtension(ext)
          next()
        })
      })
    }

    QueueUtils.run({
      log: false,
      tasks
    })
    .then(() => {
      stylesheet.components.add(ext)
      resolve()
    })
    .catch(reject)

    // if (!includeReset) {
    //   parent.addExtension(ext)
    //
    //
    //   let root = CSSUtils.createRoot()
    //   let selector = chain.
    // }
    //
    // stylesheet.components.add(ext)

    // let root = CSSUtils.createRoot()

    // SelectorUtils.resolve(atrule.parent, (err, result) => {
    //   console.log(result);
    // })

    // resolve()

    // SelectorUtils.resolveSelector(atrule.parent, (err, selector) => {
    //   ext.selector = selector
    //
    //   let root = CSSUtils.createRoot(ext.styles)
    //
    //   ext.resolveStates(root, (err, result) => {
    //     if (err) {
    //       return reject(err)
    //     }
    //
    //     atrule.replaceWith(result.toString())
    //     resolve()
    //   })
    // })
  }
}