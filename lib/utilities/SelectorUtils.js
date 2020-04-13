import nesting from 'postcss-nesting'
import CSSUtils from './CSSUtils.js'

export default class SelectorUtils {
  static clean (selector, array = false) {
    let list = this.getArray(selector)

    let output = list.map(selector => {
      let isNested = selector.startsWith('&')
      selector = selector.replace(/&/g, '')
      return isNested ? `&${selector}` : selector
    })

    return array ? output : output.join(', ')
  }

  static getArray (selector) {
    return selector.split(',').map(selector => selector.trim())
  }

  static getNestedSelectorList (parent, child, cb) {
    let parentList = this.clean(parent, true)
    let childList = this.clean(child, true)
    let append = []

    childList = childList.filter(selector => {
      if (!selector.startsWith('&')) {
        append.push(selector)
        return false
      }

      return true
    })

    let rule = CSSUtils.createRule(parentList.join(', '))
    rule.append(CSSUtils.createRule(childList.join(', ')))

    nesting.process(rule, { from: void 0 }).then(result => {
      cb([
        ...this.clean(result.root.nodes[0].selector, true),
        ...append
      ])
    })
  }
}
