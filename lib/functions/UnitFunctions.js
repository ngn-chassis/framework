import Config from '../data/Config.js'

export default class UnitFunctions {
  /**
   * @functions pxToEm
   * @param px
   * @param base
   * @return number
   */
  static pxToEm (px, base = Config.typography.minFontSize) {
    return px / base
  }

  /**
   * @functions pxToRem
   * @param px
   * @return number
   */
  static pxToRem (px, base = Config.typography.minFontSize) {
    return px / base
  }

  /**
   * @functions emToPx
   * @param em
   * @param base
   * @return number
   */
  static emToPx (em, base = Config.typography.minFontSize) {
    return em * base
  }

  /**
   * @functions remToPx
   * @param rem
   * @return number
   */
  static remToPx (rem, base = Config.typography.minFontSize) {
    return rem * base
  }
}
