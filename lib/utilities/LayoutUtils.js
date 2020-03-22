const parseValue = require('postcss-value-parser')
const Config = require('../data/Config.js')

module.exports = class LayoutUtils {
	static get width () {
		return Config.layout.constraints.width
	}

	static get height () {
		return Config.layout.constraints.height
	}

	static get gutter () {
		return Config.layout.gutter
	}

	/**
	 * @property maxGutterWidth
	 * Gutter width, in pixels, at max viewport width range.
	 */
	static get maxGutterWidth () {
		return this.getGutterLimit(Config.layout.constraints.width.max)
	}

	/**
	 * @property minGutterWidth
	 * Gutter width, in pixels, at min viewport width range.
	 */
	static get minGutterWidth () {
		return this.getGutterLimit(Config.layout.constraints.width.min)
	}

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

    let unit = parseValue.unit(layout.gutter.x).unit

    switch (unit) {
      case 'vw': return `calc(${width}px * ${parseFloat(layout.gutter.x)} / 100)`
      case '%': return `calc(${width}px * ${parseFloat(layout.gutter.x)} / 100)`

      case 'px':
			case 'em': return layout.gutter.x

      case 'rem': return `${parseFloat(layout.gutter.x) * typography.baseFontSize}px`

      default: throw ErrorUtils.createError({
        message: `"${unit}" units cannot be used for Layout Gutter. Please use vw, %, px, em or rem instead.`
      })
    }
  }
}
