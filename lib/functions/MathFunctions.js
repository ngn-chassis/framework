const parseValue = require('postcss-value-parser')
const Config = require('../Config.js')

module.exports = class MathFunctions {
  /**
   * @functions absoluteValue
   * @return number
   */
  static absoluteValue (value) {
    return Math.abs(value)
  }

  /**
   * @functions cubeRoot
   * @return number
   */
  static cubeRoot () {
    return Math.cbrt(arguments[0].nodes[0].value)
  }

  /**
   * @functions ceiling
   * @return number
   */
  static ceiling () {
    return Math.ceil(arguments[0].nodes[0].value)
  }

  /**
   * @functions evaluate
   * Evaluates a JavaScript expression and returns its value
   * @return number
   */
  static evaluate () {
    let node = arguments[0]
    let string = parseValue.stringify(node)
    let expression = string.replace(node.value, '').replace(/\(|\)/g, '')

    if (node.nodes[0].type === 'string') {
      expression = eval(expression)
    }

    return eval(expression)
  }

  /**
   * @functions floor
   * @return number
   */
  static floor () {
    return Math.floor(arguments[0].nodes[0].value)
  }

  /**
   * @functions exponentPower
   * @return number
   */
  static exponentPower () {
    let node = arguments[0]
    let base = node.nodes[0].value
    let exponent = node.nodes.length === 3 ? node.nodes[2].value : 1

    return Math.pow(base, exponent)
  }

  /**
   * @functions max
   * @return number
   */
  static max () {
    return Math.max(...this.generateArgsArray(arguments[0].nodes))
  }

  /**
   * @functions min
   * @return number
   */
  static min () {
    return Math.min(...this.generateArgsArray(arguments[0].nodes))
  }

  /**
   * @functions random
   * @return number
   */
  static random () {
    return Math.random() * (arguments[0].nodes.length ? arguments[0].nodes[0].value : 1)
  }

  /**
   * @functions round
   * @return number
   */
  static round () {
    let node = arguments[0]
    let { utils } = this.chassis
    let number = node.nodes[0].value
    let decimalPlaces = node.nodes.length === 3 ? node.nodes[2].value : 0

    return utils.math.precisionRound(number, decimalPlaces)
  }

  /**
   * @functions squareRoot
   * @return number
   */
  static squareRoot () {
    return Math.sqrt(arguments[0].nodes[0].value)
  }

  /**
   * @functions truncate
   * @return number
   */
  static truncate () {
    return Math.trunc(arguments[0].nodes[0].value)
  }
}
