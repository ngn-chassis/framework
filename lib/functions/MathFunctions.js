const parseValue = require('postcss-value-parser')

module.exports = class MathFunctions {
  static absoluteValue (value) {
    return Math.abs(value)
  }
}
