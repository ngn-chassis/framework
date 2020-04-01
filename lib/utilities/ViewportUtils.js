import Config from '../data/Config.js'
import CSSUtils from './CSSUtils.js'

export default class ViewportUtils {
  static #validOperators = ['<', '<=', '=', '>=', '>', 'from', 'to']

  static #generateQueries = (width, height) => {
    let queries = []

    if (width.min) {
      queries.push(`(min-width: ${width.min}px)`)
    }

    if (width.max) {
      queries.push(`(max-width: ${width.max - 1}px)`)
    }

    if (height.min) {
      queries.push(`(min-height: ${height.min}px)`)
    }

    if (height.max) {
      queries.push(`(max-height: ${height.max - 1}px)`)
    }

    return queries
  }

  static generateRangeCustomMedia (range) {
    let { name, width, height } = range

    return CSSUtils.createAtRule({
      name: 'custom-media',
      params: `--${name} screen and ${this.#generateQueries(width, height).join(' and ')}`
    })
  }

  static generateQuery (range, nodes = null) {
    return CSSUtils.createAtRule({
      name: 'media',
      params: `screen and ${this.#generateQueries(range).join(' and ')}`,
      nodes
    })
  }

  // static generateBreakpointCustomMedia (bp) {
  //   let { name, width, height } = bp
  //
  //   let root = CSSUtils.createRoot([])
  //   let dimension = width ? width : height
  //
  //   root.append(this.#generateBreakpoint(bp, dimension))
  //   root.append(this.#generateBreakpoint(bp, dimension, 'min'))
  //   root.append(this.#generateBreakpoint(bp, dimension, 'max'))
  //
  //   return root
  // }
  //
  // static #generateBreakpoint = (bp, dimension, type) => {
  //   let params = `--${name} screen`
  //
  //   switch (type) {
  //     case 'max':
  //       params += ` and ${width ? `(width: ${width}px)` : ''}${height ? `(height: ${height}px)` : ''}`
  //       break
  //
  //     default:
  //       params += ` and ${width ? `(width: ${width}px)` : ''}${height ? `(height: ${height}px)` : ''}`
  //       break
  //   }
  //
  //   return CSSUtils.createAtRule({
  //     name: 'custom-media',
  //     params
  //   })
  // }
}
