class ChassisTagComponent {
	constructor	(chassis) {
		this.chassis = chassis
		this.resetType = 'inline'

		this.baseTypography = chassis.settings.typography.ranges.first.typography
	}

	get variables () {
		let { settings, typography, utils } = this.chassis
    let { fontSize, lineHeight } = this.baseTypography.small
		let { scaleRatio } = settings.typography

    let lineHeightMultiplier = utils.units.toEms(lineHeight, fontSize)
    let inlineHeight = typography.calculateInlineHeight(lineHeightMultiplier)
		let paddingRoot = Math.log(lineHeightMultiplier) / 2

		let iconDimension = `${lineHeightMultiplier / scaleRatio}em`
		let iconOffset = `-${paddingRoot - utils.units.toEms(fontSize / (scaleRatio * 10), fontSize)}em`

		if (iconOffset < 0) {
			iconOffset = 0
		}

		let paddingXInPixels = utils.units.precisionRound(utils.units.toPx(scaleRatio > 1 ? scaleRatio - 1 : scaleRatio, fontSize), 0)
		let paddingX = `${utils.units.precisionRound(utils.units.toEms(paddingXInPixels, fontSize), 3)}em`

		let paddingYInitial = paddingRoot * paddingX
		let paddingY = '1px'

		if (utils.units.toPx(paddingYInitial) > 1) {
			paddingY = `${utils.units.precisionRound(paddingYInitial, 3)}em`
		}

    return {
			'font-size': `${utils.units.toEms(fontSize, this.baseTypography.root.fontSize)}em`,
      'line-height': `${lineHeightMultiplier}`,
			'padding': `${paddingY} ${paddingX}`,
			'icon-width': iconDimension,
			'icon-height': iconDimension,
			'icon-offset': `translateX(${iconOffset})`,
			'pill-padding-x': `${Math.sin(lineHeightMultiplier) / settings.typography.scaleRatio}em`,
			'pill-border-radius': `${lineHeightMultiplier}em`
    }
	}
}

module.exports = ChassisTagComponent
