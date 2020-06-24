import parseValue from 'postcss-value-parser'
import StringUtils from '../../utilities/StringUtils.js'
import ViewportUtils from '../../utilities/ViewportUtils.js'

export default class Expression {
  #parent = null
  #nodes = null
  #dimension = null
  #min = null
  #max = null

  #comparisonOperators = ['<', '<=', '=', '>=', '>']

  #operatorError = `\nInvalid media operator\nExpected one of the following: ${this.#comparisonOperators.join(', ')}`

  constructor (parent, expression) {
    this.#parent = parent
    this.#nodes = parseValue(expression).nodes.filter(node => node.type === 'word').map(node => node.value)

    if (this.#comparisonOperators.some(operator => this.#nodes.includes(operator))) {
      return this.#processComparison()
    }

    this.#processComputation()
  }

  get min () {
    return this.#min
  }

  get max () {
    return this.#max
  }

  get dimension () {
    return this.#dimension
  }

  error () {
    return this.#parent.error(...arguments)
  }

  #processComparison = () => {
    switch (this.#nodes.length) {
      case 3: return this.#processSingleComparison()
      case 5: return this.#processDoubleComparison()
      default: throw this.error(`\nInvalid expression`, { index: 1 })
    }
  }

  #processSingleComparison = () => {
    let first = 'dimension'

    let props = this.#nodes.reduce((props, node, index) => {
      if (['height', 'width'].includes(node)) {
        if (props.value) {
          first = 'value'
        }

        this.#dimension = node
      } else if (this.#comparisonOperators.includes(node)) {
        props.operator = node
      } else {
        props.value = node
      }

      return props
    }, {})

    if (!this.#dimension) {
      throw this.error(`\nInvalid media dimension\nExpected "width" or "height"`, {
        word: this.#nodes[first === 'dimension' ? 0 : 2]
      })
    }

    if (!props.operator) {
      throw this.error(this.#operatorError, { word: this.#nodes[1] })
    }

    if (!props.value) {
      throw this.error(`\nInvalid media value\nExpected pixel (px) value or viewport name prefixed with "--"`, {
        word: this.#nodes[first === 'value' ? 0 : 2]
      })
    }

    let numeric = parseInt(props.value)

    if (isNaN(numeric)) {
      return this.#processSingleViewportComparison(props, first)
    }

    let units = StringUtils.getUnits(props.value)

    if (units !== 'px') {
      throw this.error(`\nMedia query constraints must be specified in px`, { word: units })
    }

    if (props.operator === '=') {
      this.#min = numeric
      this.#max = numeric
    }

    if (first === 'value') {
      this.#processValueFirstComparison(numeric, props.operator)
    } else {
      this.#processDimensionFirstComparison(numeric, props.operator)
    }
  }

  #processValueFirstComparison = (value, operator) => {
    switch (operator) {
      case '<=':
        this.#min = value
        return

      case '>=':
        this.#max = value
        return

      case '<':
        this.#min = value + 1
        return

      case '>':
        this.#max = value - 1
        return

      default: throw this.error(this.#operatorError, { word: operator })
    }
  }

  #processDimensionFirstComparison = (value, operator) => {
    switch (operator) {
      case '<=':
        this.#max = value
        return

      case '>=':
        this.#min = value
        return

      case '<':
        this.#max = value - 1
        return

      case '>':
        this.#min = value + 1
        return

      default: this.error(this.#operatorError, { word: operator })
    }
  }

  #processDoubleComparison = () => {

  }

  #processSingleViewportComparison = (props, first) => {
    let name = props.value.replace('--', '')
    let viewport = ViewportUtils.get(name)

    if (!viewport) {
      throw this.error(`\nViewport "${name}" not found`, { word: name })
    }

    let dimensions = {
      min: NGN.coalesce(viewport.bounds.min, ViewportUtils.getPreviousBound(viewport, 'max')),
      max: NGN.coalesce(viewport.bounds.max, ViewportUtils.getNextBound(viewport, 'min'))
    }

    if (props.operator === '=') {
      this.#min = dimensions.min
      this.#max = dimensions.max - 1
      return
    }

    if (first === 'value') {
      switch (props.operator) {
        case '<=':
          this.#min = dimensions.min
          return

        case '<':
          this.#min = dimensions.max + 1
          return

        case '>=':
          this.#max = dimensions.max - 1
          return

        case '>':
          this.#max = Math.max(dimensions.min - 1, 0)
          return

        default: this.error(this.#operatorError, { word: props.operator })
      }
    }

    switch (props.operator) {
      case '<=':
        this.#max = Math.max(dimensions.max - 1, 0)
        return

      case '<':
        this.#max = Math.max(dimensions.min - 1, 0)
        return

      case '>=':
        this.#min = dimensions.min
        return

      case '>':
        this.#min = dimensions.max + 1
        return

      default: this.error(this.#operatorError, { word: props.operator })
    }
  }

  #processDoubleViewportComparison = props => {

  }

  #processComputation = () => {

  }
}
