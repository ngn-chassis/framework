class ChassisFormToggleComponent {
	constructor (chassis) {
		this.chassis = chassis
		this.resetType = 'block'
	}
	
	get variables () {
		let { layout, settings, typography, utils } = this.chassis
		let { fontSize, lineHeight } = settings.typography.ranges.first.typography.root
		
		let lineHeightMultiplier = utils.units.toEms(lineHeight, fontSize)
		let calcLineHeight = typography.calculateInlineHeight(lineHeightMultiplier)
		
		return {
			'control-margin-right': `${typography.calculateInlineMarginX(lineHeightMultiplier)}em`
		}
	}
}

module.exports = ChassisFormToggleComponent
