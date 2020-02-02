const parseValue = require('postcss-value-parser')
const Config = require('../Config.js')

module.exports = class LayoutUtils {
  /**
	 * @method getGutterLimit
	 * Get a pixel-value for gutter width at min or max viewport width ranges
	 * This prevents gutters from shrinking or enlarging when the window has
	 * shrunk below the minimum or grown larger than the maximum layout width
	 * @param {number} width in px
	 * Width of layout at current viewport size
	 * Only applicable at min or max
	 */
  static getGutterLimit (width) {
    let { layout, typography } = Config

    let unit = parseValue.unit(layout.gutter).unit

    switch (unit) {
      case 'vw': return `calc(${width}px * ${parseFloat(layout.gutter)} / 100)`
      case '%': return `calc(${width}px * ${parseFloat(layout.gutter)} / 100)`

      case 'px':
			case 'em': return layout.gutter

      case 'rem': return `${parseFloat(layout.gutter) * typography.baseFontSize}px`

      default: throw ErrorUtils.createError({
        message: `"${unit}" units cannot be used for Layout Gutter. Please use vw, %, px, em or rem instead.`
      })
    }
  }
}
