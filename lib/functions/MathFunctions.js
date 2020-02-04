const parseValue = require('postcss-value-parser')

module.exports = class MathFunctions {
  /**
   * @functions absoluteValue
   * @return number
   */
  static absoluteValue (value) {
    return Math.abs(value)
  }
}
