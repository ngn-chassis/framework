import parseValue from 'postcss-value-parser'
import { CONFIG } from '../../index.js'

export default class LayoutUtils {
	static get width () {
		return CONFIG.layout.width
	}

	static get height () {
		return CONFIG.layout.height
	}

	static get gutter () {
		return CONFIG.layout.gutter
	}

	/**
	 * @property maxGutterXWidth
	 * X axis gutter width, in pixels, at max viewport.
	 */
	static get maxGutterXWidth () {
		return this.getGutterLimit(CONFIG.layout.width.max)
	}

	/**
	 * @property minGutterXWidth
	 * X-axis gutter width, in pixels, at min viewport.
	 */
	static get minGutterXWidth () {
		return this.getGutterLimit(CONFIG.layout.width.min)
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
    let { layout, typography } = CONFIG

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

	static getMargin (display, dimension, lineHeight, multiplier = 1) {
		if (typeof multiplier === 'boolean' && multiplier) {
			multiplier = 1
		}

		switch (dimension) {
			case 'y':
			case 'top':
			case 'bottom': return this.#calculateMarginY(display, lineHeight, multiplier)

			case 'x':
			case 'left':
			case 'right': return this.#calculateMarginX(display, lineHeight, multiplier)
		}
	}

	static getPadding (display, dimension, lineHeight, multiplier = 1) {
		if (typeof multiplier === 'boolean' && multiplier) {
			multiplier = 1
		}

		switch (dimension) {
			case 'y':
			case 'top':
			case 'bottom': return this.#calculatePaddingY(display, lineHeight, multiplier)

			case 'x':
			case 'left':
			case 'right': return this.#calculatePaddingX(display, lineHeight, multiplier)
		}
	}

	static #calculateInlineHeight = (lineHeight, ratio = CONFIG.typography.scaleRatio) => {
		return lineHeight + Math.sqrt(ratio)
	}

	static #calculateMarginX = (display, lineHeight, multiplier) => {
		switch (display) {
			case 'inline-block': return Math.log(lineHeight)
			case 'block': return console.log('CALC BLOCK PADDING')
		}
	}

	static #calculateMarginY = (display, lineHeight, multiplier) => {
		switch (display) {
			case 'inline-block': return lineHeight / CONFIG.typography.scaleRatio
			case 'block': return console.log('CALC BLOCK PADDING')
		}
	}

	static #calculatePaddingX = (display, lineHeight, multiplier) => {
		return Math.sin(lineHeight)
	}

	static #calculatePaddingY = (display, lineHeight, multiplier) => {
		switch (display) {
			case 'inline-block': return (this.#calculateInlineHeight(lineHeight) - lineHeight) / 2
			case 'block': return console.log('CALC BLOCK PADDING')
		}
	}
}
