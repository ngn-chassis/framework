class ChassisTagComponent {
	constructor	(chassis) {
		this.chassis = chassis
		this.resetType = 'inline'
		
		this.baseTypography = chassis.settings.typography.ranges.first.typography
	}
	
	get variables () {
		let { settings, typography, utils } = this.chassis
    let { fontSize, lineHeight } = this.baseTypography.small

    let lineHeightMultiplier = utils.units.toEms(lineHeight, fontSize)
    let inlineHeight = typography.calculateInlineHeight(lineHeightMultiplier)
		let paddingRoot = Math.log(lineHeightMultiplier) / 2
		
		let iconDimension = `${lineHeightMultiplier / settings.typography.scaleRatio}em`
		let iconOffset = `-${paddingRoot - utils.units.toEms(fontSize / (settings.typography.scaleRatio * 10), fontSize)}em`
		
		if (iconOffset < 0) {
			iconOffset = 0
		}
		
		let paddingX = settings.typography.scaleRatio - 1
		let paddingY = paddingRoot * (settings.typography.scaleRatio - 1)

    return {
			'font-size': `${utils.units.toEms(fontSize, this.baseTypography.root.fontSize)}em`,
      'line-height': `${lineHeightMultiplier}`,
			'padding': `${paddingY}em ${paddingX}em`,
			'icon-width': iconDimension,
			'icon-height': iconDimension,
			'icon-offset': `translateX(${iconOffset})`,
			'pill-padding-x': `${Math.sin(lineHeightMultiplier) / settings.typography.scaleRatio}em`,
			'pill-border-radius': `${lineHeightMultiplier}em`
    }
	}
}

module.exports = ChassisTagComponent
