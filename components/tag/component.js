module.exports = (function () {
	let _private = new WeakMap()

	return class {
		constructor	(chassis) {
			_private.set(this, {
				chassis,
				baseTypography: chassis.settings.typography.ranges.first.typography
			})

			this.resetType = 'inline'
		}

		get variables () {
			let { settings, typography, utils } = _private.get(this).chassis
	    let { fontSize, lineHeight } = _private.get(this).baseTypography.small
			let { scaleRatio } = settings.typography

	    let lineHeightMultiplier = utils.unit.pxToEm(lineHeight, fontSize)
	    let inlineHeight = typography.calculateInlineHeight(lineHeightMultiplier)
			let paddingRoot = Math.log(lineHeightMultiplier) / 2

			let iconDimension = `${lineHeightMultiplier / scaleRatio}em`
			let iconOffset = `-${paddingRoot - utils.unit.pxToEm(fontSize / (scaleRatio * 10), fontSize)}em`

			if (iconOffset < 0) {
				iconOffset = 0
			}

			let paddingXInPixels = utils.math.precisionRound(utils.unit.emToPx(scaleRatio > 1 ? scaleRatio - 1 : scaleRatio, fontSize), 0)
			let paddingX = `${utils.math.precisionRound(utils.unit.pxToEm(paddingXInPixels, fontSize), 3)}em`

			let paddingYInitial = paddingRoot * paddingX
			let paddingY = '1px'

			if (utils.unit.emToPx(paddingYInitial) > 1) {
				paddingY = `${utils.math.precisionRound(paddingYInitial, 3)}em`
			}

	    return {
				'font-size': `${utils.unit.pxToEm(fontSize, _private.get(this).baseTypography.root.fontSize)}em`,
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
})()
