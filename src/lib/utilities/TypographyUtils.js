import { CONFIG } from '../../index.js'

export default class TypographyUtils {
  static get minSegment () {
    const { scaleRatio } = CONFIG.typography
    return (scaleRatio - 1) / scaleRatio
  }

  static get minLineHeight () {
    return 1 + this.minSegment
  }

  static get scaleRatio () {
    return CONFIG.typography.scaleRatio
  }

  static getFontSize (fontSize, variation = 0) {
    const { scaleRatio } = CONFIG.typography

    if (variation === 0) {
      return fontSize
    }

    const modifier = Math.pow(scaleRatio, Math.abs(variation) / 2)

    if (variation < 0) {
      return fontSize / modifier
    }

    return fontSize * modifier
  }

  static getOptimalLineWidth (fontSize) {
    const { cpl, charConstant } = CONFIG.typography
    return fontSize * (cpl / charConstant)
  }

  static getOptimalLineHeight (fontSize, width, columns) {
    if (!columns) {
      columns = 1
    }

    const widthFactor = (width / columns) / this.getOptimalLineWidth(fontSize)
    return Math.max(this.minLineHeight, (fontSize * (this.minLineHeight + (this.minSegment * widthFactor))) / fontSize)
  }
}
