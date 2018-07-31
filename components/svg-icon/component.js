module.exports = (function () {
	let _private = new WeakMap()

	return class {
		constructor (chassis) {
	    _private.set(this, {chassis})

	    this.resetType = 'inline-block'
		}

		get variables () {
			let { settings, utils } = _private.get(this).chassis
			let { fontSize, lineHeight } = settings.typography.ranges.first.typography.root

			let lineHeightInEms = utils.unit.pxToEm(lineHeight, fontSize)

			return {
				'width': 'auto',
				'height': `${lineHeightInEms}em`
			}
		}
	}
})()
