import Expression from './Expression.js'
import ViewportUtils from '../../utilities/ViewportUtils.js'

export default class Feature {
  #parent = null
  #dimension = 'width'

  width = {
    min: null,
    max: null
  }

  height = {
    min: null,
    max: null
  }

  constructor (parent, feature) {
    this.#parent = parent
    let { value } = feature

    if (!value.includes(' ')) {
      return this.#processViewport(value)
    }

    let expression = new Expression(this, feature.value)

    this[expression.dimension] = {
      min: expression.min,
      max: expression.max
    }
  }

  error () {
    return this.#parent.error(...arguments)
  }

  toString () {
    let dimension = this.#dimension
    let { min, max } = this[dimension]

    if (min === max) {
      return `(${dimension}: ${min}px)`
    }

    return `${min ? `(min-${dimension}: ${min}px)` : ''}${min && max ? ' and ' : ''}${max ? `(max-${dimension}: ${max}px)` : ''}`
  }

  #processViewport = name => {
    let viewport = ViewportUtils.get(name.replace('--', ''))
    this.width = NGN.coalesce(viewport.bounds)
    // this.height = NGN.coalesce(viewport.height)
  }
}
