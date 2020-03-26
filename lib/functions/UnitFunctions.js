import Config from '../data/Config.js'

export default class UnitFunctions {
  /**
   * @functions pxToEm
   * @param px
   * @param base
   * @return number
   */
  static pxToEm (px, base = Config.typography.baseFontSize) {
    return px / base
  }

  /**
   * @functions pxToRem
   * @param px
   * @return number
   */
  static pxToRem (px) {
    return px / Config.typography.baseFontSize
  }

  /**
   * @functions emToPx
   * @param em
   * @param base
   * @return number
   */
  static pxToRem (em, base = Config.typography.baseFontSize) {
    return em * Config.typography.baseFontSize
  }

  /**
   * @functions remToPx
   * @param rem
   * @return number
   */
  static pxToRem (rem) {
    return rem * Config.typography.baseFontSize
  }
}
