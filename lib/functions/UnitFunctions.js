import { CONFIG } from '../../index.js'

export default class UnitFunctions {
  /**
   * @functions pxToEm
   * @param px
   * @param base
   * @return number
   */
  static pxToEm (px, base = CONFIG.typography.baseFontSize) {
    return px / base
  }

  /**
   * @functions pxToRem
   * @param px
   * @return number
   */
  static pxToRem (px, base = CONFIG.typography.baseFontSize) {
    return px / base
  }

  /**
   * @functions emToPx
   * @param em
   * @param base
   * @return number
   */
  static emToPx (em, base = CONFIG.typography.baseFontSize) {
    return em * base
  }

  /**
   * @functions remToPx
   * @param rem
   * @return number
   */
  static remToPx (rem, base = CONFIG.typography.baseFontSize) {
    return rem * base
  }
}
