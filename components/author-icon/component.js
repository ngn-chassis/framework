module.exports = class {
	constructor (chassis) {
		Object.defineProperties(this, {
			chassis: NGN.privateconst(chassis)
		})

		this.resetType = 'inline-block'
	}

	get variables () {
		let { settings, utils } = this.chassis
		let { fontSize, lineHeight } = settings.typography.ranges.first.typography.root

		let lineHeightInEms = utils.unit.pxToEm(lineHeight, fontSize)

		return {
			'dimension': `${lineHeightInEms}em`
		}
	}
}
