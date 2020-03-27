import Config from '../data/Config.js'

export default class TypographyUtils {
  static calculateLineHeight (fontSize, viewportWidth, ratio = Config.typography.scaleRatio) {
    return this.calculateLineHeightPx(...arguments) / fontSize
	}

  static calculateLineHeightPx (fontSize, viewportWidth, ratio = Config.typography.scaleRatio) {
		return Math.max(1, (ratio - 1 / (2 * ratio) * (1 - viewportWidth / this.calculateOptimalLineWidth(fontSize))) * fontSize)
	}

  static calculateOptimalLineWidth (fontSize, ratio = Config.typography.scaleRatio) {
		return Math.pow(fontSize * ratio, 2)
	}

  static getFontSize (fontSize, increment = 0) {
    let { scaleRatio } = Config.typography

    if (increment === 0) {
      return fontSize
    }

    if (increment < 0) {
      return fontSize / Math.pow(scaleRatio, Math.abs(increment) / 2)
    }

    return fontSize * Math.pow(scaleRatio, increment / 2)
  }

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

  // static calculateOptimalFontSize (viewportWidth, baseFontSize, ratio = Config.typography.scaleRatio) {
  //   return (viewportWidth / Math.pow(ratio, 2)) / baseFontSize
  // }
}
