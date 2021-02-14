import nesting from 'postcss-nesting'

import MediaQueryRule from '../atrules/media/MediaQueryRule.js'
import CSSUtils from './CSSUtils.js'

export default class SelectorUtils {
  static clean (selector, array = false) {
    const list = this.getArray(selector)

    const output = list.map(selector => {
      const isNested = selector.startsWith('&')
      selector = selector.replace(/&/g, '')
      return isNested ? `&${selector}` : selector
    })

    return array ? output : output.join(', ')
  }

  static getArray (selector) {
    return selector.split(',').map(selector => selector.trim())
  }

  static getLineage (node) {
    const chain = []

    if (node.type !== 'root') {
      chain.unshift(node)
    }

    if (!node.parent) {
      return chain
    }

    return [...this.getLineage(node.parent), ...chain]
  }

  static getNestedSelectorList (root, cb) {
    nesting.process(root, { from: undefined }).then(result => {
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
    const root = CSSUtils.createRoot()
    let mediaQuery = null
    let previous = root

    chain.forEach(node => {
      if (node.type === 'atrule') {
        if (node.name === 'media') {
          mediaQuery = new MediaQueryRule(node)
          return
        }

        return
      }

      if (node.type === 'rule') {
        const rule = CSSUtils.createRule(node.selector)
        previous.append(rule)
        previous = rule
        return
      }

      if (node.type === 'comment') {
        return
      }

      return cb(node.error(`\nDEVELOPER ERROR\nChain cannot contain nodes of type ${node.type}`))
    })

    this.getNestedSelectorList(root, (err, result) => {
      cb(err, result, mediaQuery)
    })
  }
}
