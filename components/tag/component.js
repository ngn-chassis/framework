module.exports = (function () {
	let _ = new WeakMap()

	return class {
		constructor	(chassis) {
			_.set(this, {
				chassis,
				baseTypography: chassis.settings.typography.ranges.first.typography
			})

			this.resetType = 'inline'
		}

		get variables () {
			let { settings, typography, utils } = _.get(this).chassis
	    let { fontSize, lineHeight } = _.get(this).baseTypography.small
			let { scaleRatio } = settings.typography

	    let lineHeightMultiplier = utils.unit.pxToEm(lineHeight, fontSize)
	    let inlineHeight = typography.calculateInlineHeight(lineHeightMultiplier)
			let paddingRoot = Math.log(lineHeightMultiplier) / 2

			let iconDimension = `${lineHeightMultiplier / scaleRatio}em`
			let iconOffset = paddingRoot - utils.unit.pxToEm(fontSize / (scaleRatio * 10), fontSize)

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
				'font-size': `${utils.unit.pxToEm(fontSize, _.get(this).baseTypography.root.fontSize)}em`,
	      'line-height': `${lineHeightMultiplier}`,
				'padding': `${paddingY} ${paddingX}`,
				'icon-width': iconDimension,
				'icon-height': iconDimension,
				'left-icon-offset': `translateX(-${iconOffset}em)`,
				'right-icon-offset': `translateX(${iconOffset}em)`,
				'pill-padding-x': `${Math.sin(lineHeightMultiplier) / settings.typography.scaleRatio}em`,
				'pill-border-radius': `${lineHeightMultiplier}em`
	    }
		}
	}
})()
