class ChassisSvgIconComponent {
	constructor (chassis) {
    this.chassis = chassis
    this.resetType = 'inline-block'
	}
	
	get variables () {
		let { settings, utils } = this.chassis
		let { fontSize, lineHeight } = settings.typography.ranges.first.typography.root
		
		let lineHeightInEms = utils.units.toEms(lineHeight, fontSize)
		
		return {
			'width': 'auto',
			'height': `${lineHeightInEms}em`
		}
	}
}

module.exports = ChassisSvgIconComponent
