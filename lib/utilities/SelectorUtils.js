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

  static getNestedSelector (parent, child, cb) {
    let rule = CSSUtils.createRule(parent)
    rule.append(CSSUtils.createRule(child))

    nesting.process(rule, { from: void 0 }).then(result => {
      cb(this.clean(result.root.nodes[0].selector, true))
    })
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

    this.getNestedSelector(parentList.join(', '), childList.join(', '), result => {
      cb([...result, ...append])
    })
  }

  static resolveSelector (node, cb) {
    let { parent, type, selector } = node

    if (!parent) {
      if (type === 'rule') {
        return cb(null, selector)
      }

      return cb(node.error(`\nDEVELOPR ERROR\nCannot resolve selector on root-level ${type}.`))
    }

    let queue = new NGN.Tasks()

    queue.on('complete', () => cb(null, selector))

    if (!!parent.parent) {
      queue.add('Prepending parent selector', next => {
        this.resolveSelector(parent, (err, result) => {
          this.getNestedSelector(result, selector, combined => {
            selector = combined.join(', ')
            next()
          })
        })
      })
    }

    queue.run(true)
  }
}
