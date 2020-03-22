const Config = require('../data/Config.js')

module.exports = class UnitFunctions {
  /**
   * @functions pxToEm
   * @param px
   * @param base
   * @return number
   */
  static pxToEm (px, base = Config.typography.constraints.baseFontSize.min) {
    return px / base
  }

  /**
   * @functions pxToRem
   * @param px
   * @return number
   */
  static pxToRem (px) {
    return px / Config.typography.constraints.baseFontSize.min
  }

  /**
   * @functions emToPx
   * @param em
   * @param base
   * @return number
   */
  static pxToRem (em, base = Config.typography.constraints.baseFontSize.min) {
    return em * Config.typography.constraints.baseFontSize.min
  }

  /**
   * @functions remToPx
   * @param rem
   * @return number
   */
  static pxToRem (rem) {
    return rem * Config.typography.constraints.baseFontSize.min
  }
}
