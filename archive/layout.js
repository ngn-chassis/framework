module.exports = class {
	constructor (chassis) {
		Object.defineProperties(this, {
			chassis: NGN.privateconst(chassis)
		})

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
			case 'outer': return lineHeight * typography.scaleRatio
			case 'inner': return lineHeight
			default: return '1em'
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
		let { settings, utils } = this.chassis
		let { typography } = settings

		let unit = utils.string.getUnits(this.gutter)

		switch (unit) {
			case 'vw':
				return `calc(${width}px * ${parseFloat(this.gutter)} / 100)`

			case '%':
				return `calc(${width}px * ${parseFloat(this.gutter)} / 100)`

			case 'px':
			case 'em':
				return this.gutter

			case 'rem':
				return `${parseFloat(this.gutter) * typography.baseFontSize}px`

			default: throw this.chassis.utils.error.create({
				message: `"${unit}" units cannot be used for Layout Gutter. Please use vw, %, px, em or rem instead.`
			})
		}
	}
}
