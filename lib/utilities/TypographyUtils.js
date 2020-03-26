import Config from '../data/Config.js'

export default class TypographyUtils {
  // static getFontSizeFormula (fontSize, width) {
  //   let fontSizeDiff = fontSize.max - fontSize.min
  //   let widthDiff = width.max - width.min
  //
  //   return `calc(${fontSize.min}px + ${fontSizeDiff} * (100vw - ${width.min}px) / ${widthDiff})`
  // }

  // static getLineHeightFormula (fontSize, width) {
  //   let lineHeight = {
  //     min: this.calculateLineHeight(fontSize.min, width.min),
  //     max: this.calculateLineHeight(fontSize.max, width.max)
  //   }
  //
  //   let lineHeightDiff = lineHeight.max - lineHeight.min
  //   let widthDiff = width.max - width.min
  //
  //   return `calc(1em + ${lineHeightDiff} * (100vw - ${width.min}px) / ${widthDiff})`
  // }

  // static getLineHeightFormula (fontSize, lineHeight, width) {
  //   let minLineHeightInEms = lineHeight.min / fontSize.min
  //   let lineHeightDiff = lineHeight.max - lineHeight.min
  //   let minWidthInRems = width.min / fontSize.min
  //   let widthDiff = width.max - width.min
  //
  //   return `calc(${minLineHeightInEms}rem + ${lineHeightDiff} * (100vw - ${width.min}px) / ${widthDiff})`
  // }

  // static get scaleRatio () {
  //   return Config.typography.scaleRatio
  // }

  // In px
  static calculateLineHeight (fontSize, viewportWidth, ratio = Config.typography.scaleRatio) {
    return this.calculateLineHeightPx(...arguments) / fontSize
	}

  static calculateLineHeightPx (fontSize, viewportWidth, ratio = Config.typography.scaleRatio) {
    // let minLineHeight = fontSize * (1 + Math.abs(1 - (1 / ratio)))
		return Math.max(1, (ratio - 1 / (2 * ratio) * (1 - viewportWidth / this.calculateOptimalLineWidth(fontSize))) * fontSize)
	}

  static calculateOptimalLineWidth (fontSize, ratio = Config.typography.scaleRatio) {
		return Math.pow(fontSize * ratio, 2)
	}

  // static calculateOptimalFontSize (viewportWidth, baseFontSize, ratio = Config.typography.scaleRatio) {
  //   return (viewportWidth / Math.pow(ratio, 2)) / baseFontSize
  // }
}
