import Config from '../data/Config.js'
import CSSUtils from './CSSUtils.js'
import UnitUtils from './UnitUtils.js'

export default class TypographyUtils {
  static get minSegment () {
    let { scaleRatio } = Config.typography
    return (scaleRatio - 1) / scaleRatio
  }

  static get minLineHeight () {
    return 1 + this.minSegment
  }

  static get scaleRatio () {
    return Config.typography.scaleRatio
  }

  static getFontSize (fontSize, increment = 0) {
    let { scaleRatio } = Config.typography

    if (increment === 0) {
      return fontSize
    }

    let modifier = Math.pow(scaleRatio, Math.abs(increment) / 2)

    if (increment < 0) {
      return fontSize / modifier
    }

    return fontSize * modifier
  }

  static getOptimalLineWidth (fontSize) {
    let { cpl, charConstant } = Config.typography

    return fontSize * (cpl / charConstant)
	}

  static getOptimalLineHeight (fontSize, width, columns = 1) {
    let widthFactor = (width / columns) / this.getOptimalLineWidth(fontSize)
    return Math.max(this.minLineHeight, (fontSize * (this.minLineHeight + (this.minSegment * widthFactor))) / fontSize)
  }

  // static getProportionalLineHeight (increment = 0, ratio = this.scaleRatio) {
  //   let lineHeight = {
  //     min: this.minLineHeight,
  //     max: ratio
  //   }
  //
  //   let fontSize = this.getFontSize(increment) / Config.typography.fontSize.min
  //   let lineHeightDiff = lineHeight.max - lineHeight.min
  //
  //   return lineHeight.min + (lineHeightDiff / fontSize)
  // }
}
