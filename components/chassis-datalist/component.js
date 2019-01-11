module.exports = class {
	constructor (chassis) {
		Object.defineProperties(this, {
			chassis: NGN.privateconst(chassis)
		})

		this.resetType = 'inline-block'
	}

	get variables () {
		let { settings, typography, utils } = this.chassis
		let { fontSize, lineHeight } = settings.typography.ranges.first.typography.root

		let lineHeightMultiplier = utils.unit.pxToEm(lineHeight, fontSize)
		let inlineHeight = typography.calculateInlineHeight(lineHeightMultiplier)
		let padding = (inlineHeight - lineHeightMultiplier) / 2

		return {
			'icon-offset': `translateX(-${(typography.calculateInlinePaddingX(lineHeightMultiplier) / 2) - utils.unit.pxToEm(fontSize / (settings.typography.scaleRatio * 10), fontSize)}em)`,
			'pill-padding-x': `${settings.typography.scaleRatio}em`,
			'pill-border-radius': `${lineHeightMultiplier}em`
		}
	}
}
