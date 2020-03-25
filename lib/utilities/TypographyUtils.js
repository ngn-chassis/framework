import Config from '../data/Config.js'

export default class TypographyUtils {
  static get baseFontSize () {
    return Config.typography.constraints.baseFontSize
  }

  static get baseLineHeight () {
    let { baseFontSize } = Config.typography.constraints

    return {
      min: TypographyUtils.calculateLineHeight(baseFontSize.min, Config.layout.constraints.width.min),
      max: TypographyUtils.calculateLineHeight(baseFontSize.max, Config.layout.constraints.width.max)
    }
  }

  static getCalculatedFontSize (fontSize, width) {
    let fontSizeDiff = fontSize.max - fontSize.min
    let widthDiff = width.max - width.min
    let screenSizeOffset = `(100vw - ${width.min}px)`

    return `${fontSize.min}px + ${fontSizeDiff} * ${screenSizeOffset} / ${widthDiff}`
  }

  static getCalculatedLineHeight (fontSize, lineHeight, width) {
    let lineHeightDiff = lineHeight.max - lineHeight.min
    let fontSizeDiff = fontSize.max - fontSize.min
    let widthDiff = width.max - width.min
    let screenSizeOffset = `(100vw - ${width.min}px)`

    return `${lineHeight.min / fontSize.min}em + ${(lineHeightDiff / fontSizeDiff) * fontSize.min} * ${screenSizeOffset} / ${widthDiff}`
  }

  static get scaleRatio () {
    return Config.typography.scaleRatio
  }

  // In px
  static calculateLineHeight (fontSize, viewportWidth, ratio = Config.typography.scaleRatio) {
		return (ratio - 1 / (2 * ratio) * (1 - viewportWidth / this.calculateOptimalLineWidth(fontSize))) * fontSize
	}

  static calculateOptimalLineWidth (fontSize, ratio = Config.typography.scaleRatio) {
		return Math.pow(fontSize * ratio, 2)
	}

  static calculateOptimalFontSize (viewportWidth, baseFontSize, ratio = Config.typography.scaleRatio) {
    return ((viewportWidth / Math.pow(ratio, 2)) / baseFontSize)
  }
}
