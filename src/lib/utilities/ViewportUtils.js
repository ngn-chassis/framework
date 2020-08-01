import { CONFIG } from '../../index.js'
import CSSUtils from './CSSUtils.js'

export default class ViewportUtils {
  static #validOperators = ['<', '<=', '=', '>=', '>', 'from', 'to']

  static #generateQueries = (width = {}) => {
    const queries = []

    if (width.min) {
      queries.push(`(min-width: ${width.min}px)`)
    }

    if (width.max) {
      queries.push(`(max-width: ${width.max - 1}px)`)
    }

    return queries
  }

  static generateCustomMedia (viewport) {
    const { name, bounds } = viewport

    return CSSUtils.createAtRule({
      name: 'custom-media',
      params: `--${name} screen and ${this.#generateQueries(bounds).join(' and ')}`
    })
  }

  static get (name) {
    if (typeof name === 'number') {
      return CONFIG.viewports[name]
    }

    return CONFIG.viewports.find(viewport => viewport.name === name)
  }

  static getIndex (viewport) {
    const name = typeof viewport === 'string' ? viewport : viewport.name
    return CONFIG.viewports.findIndex(viewport => viewport.name === name)
  }

  static getPrevious (viewport) {
    return this.get((typeof viewport === 'number' ? viewport : this.getIndex(viewport)) - 1)
  }

  static getPreviousBound (viewport, name, checkFontSize = true) {
    const previous = this.getPrevious(viewport)

    if (!previous) {
      return null
    }

    const bound = this.getBound(previous, name)

    if ((checkFontSize && !previous.fontSize) || !bound) {
      return this.getPreviousBound(previous, name, checkFontSize)
    }

    return bound
  }

  static getNext (viewport) {
    return this.get((typeof viewport === 'number' ? viewport : this.getIndex(viewport)) + 1)
  }

  static getNextBound (viewport, name, checkFontSize = true) {
    const next = this.getNext(viewport)

    if (!next) {
      return null
    }

    const bound = this.getBound(next, name)

    if ((checkFontSize && !next.fontSize) || !bound) {
      return this.getNextBound(next, name, checkFontSize)
    }

    return bound
  }

  static getBound (viewport, name, checkFontSize = true) {
    if (!viewport) {
      if (name === 'min') {
        return CONFIG.layout.width.min
      }

      return null
    }

    return viewport.bounds[name]
  }
}
