module.exports = (function () {
	let _ = new WeakMap()

	return class {
		constructor (chassis) {
	    _.set(this, {chassis})

	    this.resetType = 'inline-block'
		}

		get variables () {
			let { settings, utils } = _.get(this).chassis
			let { fontSize, lineHeight } = settings.typography.ranges.first.typography.root

			let lineHeightInEms = utils.unit.pxToEm(lineHeight, fontSize)

			return {
				'width': 'auto',
				'height': `${lineHeightInEms}em`
			}
		}
	}
})()
