import Config from '../data/Config.js'
import CSSUtils from './CSSUtils.js'

export default class ViewportUtils {
  static #validOperators = ['<', '<=', '=', '>=', '>', 'from', 'to']

  static #generateQueryString = range => {
    let { bounds, type } = range

    return `screen${bounds.min ? ` and (min-${type}: ${bounds.min}px)` : ''}${bounds.max ? ` and (max-${type}: ${bounds.max}px)` : ''}`
  }

  static generateCustomMedia (range) {
    let { name } = range

    return CSSUtils.createAtRule({
      name: 'custom-media',
      params: `--${name} ${this.#generateQueryString(range)}`
    })
  }

  static generateQuery (range, nodes = null) {
    return CSSUtils.createAtRule({
      name: 'media',
      params: this.#generateQueryString(range),
      nodes
    })
  }
}
