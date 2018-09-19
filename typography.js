module.exports = (function () {
	let _private = new WeakMap()

	return class {
		constructor (chassis) {
			_private.set(this, {
				chassis,

				fontSizeAliases: chassis.constants.typography.sizeAliases,
				root: chassis.settings.typography.baseFontSize,
				scale: {
					threshold: chassis.constants.typography.scale.threshold,
					ratio: chassis.settings.typography.scaleRatio
				}
			})
		}

		get ranges () {
			let { constants, settings } = _private.get(this).chassis
			let rootFontSize = _private.get(this).root

			let breakpoints = constants.typography.breakpoints.filter(breakpoint => {
				return breakpoint <= settings.layout.maxWidth
			})

			return breakpoints.map((breakpoint, index) => {
				if (index === breakpoints.length - 1) {
					return
				}

				let bounds = {
					lower: breakpoint,
					upper: breakpoints[index + 1]
				}

				if (bounds.lower >= _private.get(this).scale.threshold) {
					rootFontSize++
				}

				return {
					bounds,
					typography: this.getViewportSettings({bounds, rootFontSize})
				}
			}).filter(Boolean)
		}

		calculateFontSize (alias, multiplier = 1, root = _private.get(this).root) {
			if (alias === 'root') {
				return root
			}

			let modifier = 1

			switch (alias) {
				case 'small':
					modifier = 1 / Math.sqrt(_private.get(this).scale.ratio)
					break

				case 'large':
					modifier = Math.sqrt(_private.get(this).scale.ratio)
					break

				case 'larger':
					modifier = _private.get(this).scale.ratio
					break

				case 'largest':
					modifier = Math.pow(_private.get(this).scale.ratio, 2)
					break

				default:
					console.error(`[ERROR] Chassis Auto-Typography: Font scale "${alias}" not found. Defaulting to root.`)
			}

			return root * modifier * multiplier
		}

		calculateInlineHeight (baseLineHeight, ratio = _private.get(this).scale.ratio) {
			return baseLineHeight + Math.sqrt(ratio)
		}

		calculateInlineMarginY (baseLineHeight, ratio = _private.get(this).scale.ratio) {
			return 1
		}

		calculateInlineMarginX (baseLineHeight, ratio = _private.get(this).scale.ratio) {
			return Math.log(baseLineHeight)
		}

		calculateInlinePaddingX (baseLineHeight, ratio = _private.get(this).scale.ratio) {
			return Math.sin(baseLineHeight)
		}

		calculateInlinePaddingY (baseLineHeight) {
			return (this.calculateInlineHeight(baseLineHeight) - baseLineHeight) / 2
		}

		calculateLineHeight (fontSize, viewportWidth, ratio = _private.get(this).scale.ratio) {
			return (ratio - 1 / (2 * ratio) * (1 - viewportWidth / this.calculateOptimalLineWidth(fontSize))) * fontSize
		}

		calculateOptimalLineWidth (fontSize, ratio = _private.get(this).scale.ratio) {
			return Math.pow(fontSize * ratio, 2)
		}

		calculateMarginBottom (lineHeight, ratio = _private.get(this).scale.ratio) {
			return lineHeight / ratio
		}

		getViewportSettings (vwr) {
			let averageViewportWidth = (vwr.bounds.lower + vwr.bounds.upper) / 2
			let rules = {}

			_private.get(this).fontSizeAliases.forEach(alias => {
				let fontSize = this.calculateFontSize(alias, 1, vwr.rootFontSize)

				rules[alias] = {
					fontSize,
					lineHeight: this.calculateLineHeight(fontSize, averageViewportWidth)
				}
			})

			return rules
		}
	}
})()
