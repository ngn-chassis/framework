import Config from '../data/Config.js'
import UnitUtils from './UnitUtils.js'

export default class TypographyUtils {
  // static getLineHeight (fontSize, viewportWidth, ratio = Config.typography.scaleRatio) {
  //   return this.getLineHeightPx(...arguments) / fontSize
	// }
  //
  // static getLineHeightFormula (fontSize = Config.typography.fontSize, width = Config.layout.width, modifier = 0, dynamic = false) {
  //   return UnitUtils.pxToRelative(this.getLineHeightPx(fontSize.min, width.min), this.getFontSize(modifier, fontSize.min))
  // }
  //
  // static getLineHeightPx (fontSize, viewportWidth, ratio = Config.typography.scaleRatio) {
  //   let minLineHeight = 1 + (ratio - 1 / ratio)
  //   let widthFactor = (viewportWidth > 1024 ? viewportWidth * minSegment : viewportWidth) / this.getOptimalLineWidth(fontSize)
  //
  //   return Math.max(minLineHeight, fontSize * (minLineHeight + (minSegment * widthFactor)));
	// }

  static get minSegment () {
    let { scaleRatio } = Config.typography
    return (scaleRatio - 1) / scaleRatio
  }

  static get minLineHeight () {
    return 1 + this.minSegment
  }

  static getWidthBasedLineHeight (fontSize, viewportWidth, orientation = 'landscape', ratio = Config.typography.scaleRatio) {
    let base = viewportWidth

    if (base >= 1024 && orientation === 'landscape') {
      base = viewportWidth / 2
    }

    let widthFactor = base / this.getOptimalLineWidth(fontSize)

    return Math.max(this.minLineHeight, (fontSize * (this.minLineHeight + (this.minSegment * widthFactor))) / fontSize)
  }

  static getProportionalLineHeight (increment, ratio = Config.typography.scaleRatio) {
    let lineHeight = {
      min: this.minLineHeight,
      max: ratio
    }

    let fontSize = this.getFontSize(increment) / Config.typography.fontSize.min
    let lineHeightDiff = lineHeight.max - lineHeight.min

    return lineHeight.min + (lineHeightDiff / fontSize)
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

  static getFontSizeRems (fontSize = Config.typography.fontSize, modifier = 0) {
    return `${UnitUtils.pxToRelative(this.getFontSize(modifier, fontSize))}rem`
  }

  static getOptimalLineWidth (fontSize, ratio = Config.typography.scaleRatio) {
    let { cpl, charConstant } = Config.typography

    return fontSize * (cpl / charConstant)
	}
}
