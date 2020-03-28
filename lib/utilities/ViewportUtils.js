import Config from '../data/Config.js'
import CSSUtils from './CSSUtils.js'

export default class ViewportUtils {
  static #validOperators = ['<', '<=', '=', '>=', '>', 'from', 'to']

  static #generateQueries = range => {
    let { bounds, type } = range

    let queries = []

    if (bounds.min) {
      queries.push(`(min-${type}: ${bounds.min}px)`)
    }

    if (bounds.max) {
      queries.push(`(max-${type}: ${bounds.max}px)`)
    }

    return queries
  }

  static generateCustomMedia (range) {
    let { name } = range

    return CSSUtils.createAtRule({
      name: 'custom-media',
      params: `--${name} screen and ${this.#generateQueries(range).join(' and')}`
    })
  }

  static generateQuery (range, nodes = null) {
    return CSSUtils.createAtRule({
      name: 'media',
      params: `screen and ${this.#generateQueries(range).join(' and ')}`,
      nodes
    })
  }
}
