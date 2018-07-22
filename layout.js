class ChassisLayout {
	constructor (chassis) {
		this.chassis = chassis

		for (let property in chassis.settings.layout) {
			this[property] = chassis.settings.layout[property]
		}
	}

	/**
	 * @property maxGutterWidth
	 * Gutter width, in pixels, at max viewport width range.
	 */
	get maxGutterWidth () {
		return this.getGutterLimit(this.maxWidth)
	}

	/**
	 * @property minGutterWidth
	 * Gutter width, in pixels, at min viewport width range.
	 */
	get minGutterWidth () {
		return this.getGutterLimit(this.minWidth)
	}

	calculateMarginBottom (lineHeight, type = null) {
		let { typography } = this.chassis.settings

		switch (type) {
			case 'outer':
				return lineHeight * typography.scaleRatio
				break

			case 'inner':
				return lineHeight
				break

			default:
				return '1em'
		}
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
	getGutterLimit (width) {
		let { utils } = this.chassis
		let { typography } = this.chassis.settings

		let unit = utils.string.getUnit(this.gutter)

		switch (unit) {
			case 'vw':
				return `calc(${width}px * ${parseFloat(this.gutter)} / 100)`
				break

			case '%':
				return `calc(${width}px * ${parseFloat(this.gutter)} / 100)`
				break

			case 'px':
			case 'em':
				return this.gutter
				break

			case 'rem':
				return `${parseFloat(this.gutter) * typography.baseFontSize}px`
				break

			default:
				console.error(`"${unit}" units cannot be used for Layout Gutter. Please use vw, %, px, em or rem instead.`)
		}
	}
}

module.exports = ChassisLayout
