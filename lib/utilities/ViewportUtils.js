import Config from '../data/Config.js'
import CSSUtils from './CSSUtils.js'

export default class ViewportUtils {
  static #validOperators = ['<', '<=', '=', '>=', '>', 'from', 'to']

  static #generateQueries = (width = {}/*, height = {}*/) => {
    let queries = []

    if (width.min) {
      queries.push(`(min-width: ${width.min}px)`)
    }

    if (width.max) {
      queries.push(`(max-width: ${width.max - 1}px)`)
    }

    // if (height.min) {
    //   queries.push(`(min-height: ${height.min}px)`)
    // }
    //
    // if (height.max) {
    //   queries.push(`(max-height: ${height.max - 1}px)`)
    // }

    return queries
  }

  static generateCustomMedia (viewport) {
    let { name, bounds, height } = viewport

    return CSSUtils.createAtRule({
      name: 'custom-media',
      params: `--${name} screen and ${this.#generateQueries(bounds).join(' and ')}`
    })
  }

  static get (name) {
    if (typeof name === 'number') {
      return Config.viewports[name]
    }

    return Config.viewports.find(viewport => viewport.name === name)
  }

  static getBound (viewport, dimension, name) {
    if (!viewport) {
      return null
    }

    let set = viewport[dimension]

    if (!set || !set[name]) {
      return null
    }

    return set[name]
  }

  static getIndex (viewport) {
    let name = typeof viewport === 'string' ? viewport : viewport.name
    return Config.viewports.findIndex(viewport => viewport.name === name)
  }

  static getPrevious (viewport) {
    return this.get((typeof viewport === 'number' ? viewport : this.getIndex(viewport)) - 1)
  }

  static getPreviousBound (viewport, dimension, name, checkFontSize = true) {
    let previous = this.getPrevious(viewport)

    if (!previous) {
      return null
    }

    let bound = this.getBound(previous, dimension, name)

    if ((checkFontSize && !previous.fontSize) || !bound) {
      return this.getPreviousBound(previous, dimension, name, checkFontSize)
    }

    return bound
  }

  static getNext (viewport) {
    return this.get((typeof viewport === 'number' ? viewport : this.getIndex(viewport)) + 1)
  }

  static getNextBound (viewport, dimension, name, checkFontSize = true) {
    let next = this.getNext(viewport)

    if (!next) {
      return null
    }

    let bound = this.getBound(next, dimension, name)

    if ((checkFontSize && !next.fontSize) || !bound) {
      return this.getNextBound(next, dimension, name, checkFontSize)
    }

    return bound
  }

  static getBound (viewport, dimension, name, checkFontSize = true) {
    if (!viewport) {
      if (name === 'min') {
        return Config.layout[dimension].min
      }

      return null
    }

    return viewport[dimension][name]
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
