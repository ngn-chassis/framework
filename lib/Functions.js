const MathFunctions = require('./functions/MathFunctions.js')

module.exports = class Functions {
  /**
   * @mixin import
   * Import a file or directory of files into the style sheet.
   */
  static abs (value) {
    return MathFunctions.absoluteValue(value)
  }
}
