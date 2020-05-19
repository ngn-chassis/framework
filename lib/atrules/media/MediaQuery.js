import AtRule from '../AtRule.js'
import Config from '../../data/Config.js'

import parser from 'postcss-scss'
import MQParser from 'postcss-media-query-parser'
import MQProcessor from 'postcss-media-minmax'

import Feature from './Feature.js'

import StringUtils from '../../utilities/StringUtils.js'

export default class MediaQuery extends AtRule {
  #viewport = null

  #features = []
  #type = null
  #params = null

  constructor (atrule) {
    super({
      root: atrule,
      format: 'rule[ and[ rule[...]]]',
      ordered: false,

      args: [{
        name: 'condition',
        types: ['word', 'function'],
        chainable: true,
        delimiter: 'and'
      }]
    })

    this.#params = this.root.params

    this.#registerExpressions(this.#params)
  }

  get features () {
    return this.#features
  }

  get type () {
    return this.#type
  }

  get params () {
    return this.#params
  }

  get width () {
    return this.#features.reduce((width, feature) => {
      ;['min', 'max'].forEach(bound => {
        if (feature.width[bound]) {
          if (width[bound]) {
            throw this.error(`\nInvalid media query\nMultple min-widths`)
          }

          width[bound] = feature.width[bound]
        }
      })

      return width
    }, {
      min: null,
      max: null
    })
  }

  #registerExpressions = params => {
    MQParser.default(params).nodes.forEach(query => {
      query.nodes.forEach(node => {
        if (node.type !== 'media-feature-expression') {
          return
        }

        this.#registerExpression(node)
      })
    })
  }

  #registerExpression = expression => {
    if (expression.value.includes(':')) {
      return this.#registerStandardSyntax(expression.nodes)
    }

    let features = expression.nodes.filter(node => node.type === 'media-feature')

    if (features.length === 0) {
      throw this.error(`\nInvalid media query`)
    }

    features.forEach(node => {
      let feature = new Feature(this, node)
      this.#params = this.#params.replace(`(${node.value})`, feature.toString())
      this.#features.push(feature)
    })
  }

  #registerStandardSyntax = nodes => {
    let [feature, value] = nodes.filter(node => node.type !== 'colon').map(node => node.value)
    value = parseInt(value)

    if (typeof value !== 'number') {
      return
    }

    let result = {
      width: {
        min: null,
        max: null
      },

      height: {
        min: null,
        max: null
      }
    }

    switch (feature) {
      case 'min-width':
        result.width.min = value
        break

      case 'max-width':
        result.width.max = value
        break

      case 'min-height':
        result.height.min = value
        break

      case 'max-height':
        result.height.max = value
        break
    }

    this.#features.push(result)
  }
}
