class ChassisTableComponent {
	constructor	(chassis) {
		this.chassis = chassis
		this.resetType = 'block'
	}
	
	get variables () {
		let { settings, typography, utils } = this.chassis
		let { fontSize, lineHeight } = settings.typography.ranges.first.typography.root

		let lineHeightMultiplier = utils.units.toEms(lineHeight, fontSize)
		
		return {
			'cell-padding-x': `${typography.calculateInlinePaddingX(lineHeightMultiplier)}em`,
			'cell-line-height': `${typography.calculateInlineHeight(lineHeightMultiplier)}`
		}
	}
}

module.exports = ChassisTableComponent
