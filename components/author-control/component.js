module.exports = class {
	constructor (chassis) {
		Object.defineProperties(this, {
			chassis: NGN.privateconst(chassis)
		})

		this.resetType = 'block'
	}

	get variables () {
		let { layout, settings, typography, utils } = this.chassis
		let { fontSize, lineHeight } = settings.typography.ranges.first.typography.root

		let lineHeightMultiplier = utils.unit.pxToEm(lineHeight, fontSize)
		let calcLineHeight = typography.calculateInlineHeight(lineHeightMultiplier)

		return {
			'toggle-margin-right': `${typography.calculateInlineMarginX(lineHeightMultiplier)}em`,
			'margin-bottom': `${layout.calculateMarginBottom(lineHeightMultiplier, 'inner')}em`,
			'input-margin-top': `${(calcLineHeight - lineHeightMultiplier) / 2}em`
		}
	}
}
