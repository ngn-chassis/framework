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

  static getCalcValue (base, width) {
    let baseDiff = base.max - base.min
    let widthDiff = width.max - width.min
    let screenSize = `(100vw - ${width.min}px)`

    return `${base.min}px + ${baseDiff} * ${screenSize} / ${widthDiff}`
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
}
