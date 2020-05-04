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

  static getParentChain (node) {
    let chain = []

    if (node.type !== 'root') {
      chain.unshift(node)
    }

    if (!node.parent) {
      return chain
    }

    return [...this.getParentChain(node.parent), ...chain]
  }

  static getNestedSelectorList (root, cb) {
    nesting.process(root, { from: void 0 }).then(result => {
      cb(null, result.root.nodes.map(node => node.selector).join(', '))
    }).catch(cb)
  }

  static parse (selector) {
    return this.clean(selector, true).reduce((parts, part) => {
      if (part.startsWith('&')) {
        parts.nested.push(part)
      } else {
        parts.standalone.push(part)
      }

      return parts
    }, {
      nested: [],
      standalone: []
    })
  }

  static resolve (chain, cb) {
    let root = CSSUtils.createRoot()
    let previous = root

    chain.forEach(node => {
      if (node.type !== 'rule') {
        return cb(node.error(`\nDEVELOPER ERROR\nChain cannot contain nodes of type ${node.type}`))
      }

      let rule = CSSUtils.createRule(node.selector)
      previous.append(rule)
      previous = rule
    })

    this.getNestedSelectorList(root, cb)
  }
}
