const Config = require('../Config.js')

module.exports = class TypographyUtils {
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

  static get scaleRatio () {
    return Config.typography.scaleRatio
  }

  static get averageFontSize () {
    let { min, max } = Config.typography.constraints.baseFontSize
    return (max + min) / 2
  }

  // In px
  static calculateLineHeight (fontSize, viewportWidth, ratio = Config.typography.scaleRatio) {
		return (ratio - 1 / (2 * ratio) * (1 - viewportWidth / this.calculateOptimalLineWidth(fontSize))) * fontSize
	}

  static calculateOptimalLineWidth (fontSize, ratio = Config.typography.scaleRatio) {
		return Math.pow(fontSize * ratio, 2)
	}
}
