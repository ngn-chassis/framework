import { CONFIG } from '../../index.js'
import CSSUtils from './CSSUtils.js'
import UnitUtils from './UnitUtils.js'

export default class TypographyUtils {
  static get minSegment () {
    let { scaleRatio } = CONFIG.typography
    return (scaleRatio - 1) / scaleRatio
  }

  static get minLineHeight () {
    return 1 + this.minSegment
  }

  static get scaleRatio () {
    return CONFIG.typography.scaleRatio
  }

  static getFontSize (fontSize, variation = 0) {
    let { scaleRatio } = CONFIG.typography

    if (variation === 0) {
      return fontSize
    }

    let modifier = Math.pow(scaleRatio, Math.abs(variation) / 2)

    if (variation < 0) {
      return fontSize / modifier
    }

    return fontSize * modifier
  }

  static getOptimalLineWidth (fontSize) {
    let { cpl, charConstant } = CONFIG.typography

    return fontSize * (cpl / charConstant)
	}

  static getOptimalLineHeight (fontSize, width, columns) {
    if (!columns) {
      columns = 1
    }

    let widthFactor = (width / columns) / this.getOptimalLineWidth(fontSize)
    return Math.max(this.minLineHeight, (fontSize * (this.minLineHeight + (this.minSegment * widthFactor))) / fontSize)
  }

  // static getProportionalLineHeight (variation = 0, ratio = this.scaleRatio) {
  //   let lineHeight = {
  //     min: this.minLineHeight,
  //     max: ratio
  //   }
  //
  //   let fontSize = this.getFontSize(variation) / CONFIG.typography.baseFontSize
  //   let lineHeightDiff = lineHeight.max - lineHeight.min
  //
  //   return lineHeight.min + (lineHeightDiff / fontSize)
  // }
}
