class ChassisFormFieldComponent {
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
			'margin-bottom': `${layout.calculateMarginBottom(lineHeightMultiplier, 'inner')}em`,
			'input-margin-top': `${(calcLineHeight - lineHeightMultiplier) / 2}em`
		}
	}
}

module.exports = ChassisFormFieldComponent
