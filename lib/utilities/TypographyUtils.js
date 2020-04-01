import Config from '../data/Config.js'
import UnitUtils from './UnitUtils.js'

export default class TypographyUtils {
  static getLineHeight (fontSize, viewportWidth, ratio = Config.typography.scaleRatio) {
    return this.getLineHeightPx(...arguments) / fontSize
	}

  static getLineHeightPx (fontSize, viewportWidth, ratio = Config.typography.scaleRatio) {
		return Math.max(1, (ratio - 1 / (2 * ratio) * (1 - viewportWidth / this.getOptimalLineWidth(fontSize))) * fontSize)
	}

  static getOptimalLineWidth (fontSize, ratio = Config.typography.scaleRatio) {
		return Math.pow(fontSize * ratio, 2)
	}

  static getFontSize (increment = 0, fontSize = Config.typography.fontSize.min) {
    let { scaleRatio } = Config.typography

    if (increment === 0) {
      return fontSize
    }

    if (increment < 0) {
      return fontSize / Math.pow(scaleRatio, Math.abs(increment) / 2)
    }

    return fontSize * Math.pow(scaleRatio, increment / 2)
  }

  static getFontSizeFormula (fontSize = Config.typography.fontSize, width = Config.layout.width, modifier = 0, dynamic = false) {
    let { layout, typography } = Config

    fontSize = {
      min: this.getFontSize(modifier, fontSize.min),
      max: this.getFontSize(modifier, fontSize.max)
    }

    if (dynamic) {
      let fontSizeDiff = fontSize.max - fontSize.min
      let widthDiff = width.max - width.min

      return `calc(${fontSize.min}px + ${fontSizeDiff} * (100vw - ${width.min}px) / ${widthDiff})`
    }

    return `${UnitUtils.pxToRelative(fontSize.min)}rem`
  }

  static getLineHeightFormula (fontSize = Config.typography.fontSize, width = Config.layout.width, modifier = 0, dynamic = false) {
    let { layout, typography } = Config

    fontSize = {
      min: this.getFontSize(modifier, fontSize.min),
      max: this.getFontSize(modifier, fontSize.max)
    }

    let lineHeight = {
      min: this.getLineHeightPx(fontSize.min, width.min),
      max: this.getLineHeightPx(fontSize.max, width.max)
    }

    if (dynamic) {
      let lineHeightDiff = lineHeight.max - lineHeight.min
      let widthDiff = width.max - width.min

      return `calc(${lineHeight.min}px + ${lineHeightDiff} * (100vw - ${width.min}px) / ${widthDiff})`
    }

    return UnitUtils.pxToRelative(lineHeight.min, fontSize.min)
  }

  // static getFontSizeFormula (fontSize, width) {
  //   let fontSizeDiff = fontSize.max - fontSize.min
  //   let widthDiff = width.max - width.min
  //
  //   return `calc(${fontSize.min}px + ${fontSizeDiff} * (100vw - ${width.min}px) / ${widthDiff})`
  // }

  // static getLineHeightFormula (fontSize, width) {
  //   let lineHeight = {
  //     min: this.getLineHeight(fontSize.min, width.min),
  //     max: this.getLineHeight(fontSize.max, width.max)
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
