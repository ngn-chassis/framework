import parseValue from 'postcss-value-parser'
import Config from '../data/Config.js'

export default class LayoutUtils {
	static get width () {
		return Config.layout.width
	}

	static get height () {
		return Config.layout.height
	}

	static get gutter () {
		return Config.layout.gutter
	}

	/**
	 * @property maxGutterXWidth
	 * X axis gutter width, in pixels, at max viewport.
	 */
	static get maxGutterXWidth () {
		return this.getGutterLimit(Config.layout.width.max)
	}

	/**
	 * @property minGutterXWidth
	 * X-axis gutter width, in pixels, at min viewport.
	 */
	static get minGutterXWidth () {
		return this.getGutterLimit(Config.layout.width.min)
	}

  /**
	 * @method getGutterLimit
	 * Get a pixel-value for gutter width at min or max viewports.
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
			case 'em':
			case 'rem': return layout.gutter.x

      // case 'rem': return `${parseFloat(layout.gutter.x) * typography.baseFontSize.min}px`

      default: throw ErrorUtils.createError({
        message: `"${unit}" units cannot be used for Layout Gutter. Please use vw, %, px, em or rem instead.`
      })
    }
  }
}
