class ChassisTypography {
	constructor (chassis) {
		this.chassis = chassis

		let { settings, constants } = chassis

		this.root = settings.typography.baseFontSize
		this.fontSizeAliases = constants.typography.sizeAliases

		this.scale = {
			threshold: constants.typography.scale.threshold,
			ratio: settings.typography.scaleRatio
		}
	}

	get ranges () {
		let { constants, settings } = this.chassis
		let rootFontSize = this.root

		let breakpoints = constants.typography.breakpoints.filter((breakpoint) => {
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

			if (bounds.lower >= this.scale.threshold) {
				rootFontSize++
			}

			return {
				bounds,
				typography: this.getViewportSettings({bounds, rootFontSize})
			}
		}).filter((vwr) => vwr !== undefined)
	}

	calculateFontSize (alias, multiplier = 1, root = this.root) {
		if (alias === 'root') {
			return root
		}

		let modifier = 1

		switch (alias) {
			case 'small':
				modifier = 1 / Math.sqrt(this.scale.ratio)
				break

			case 'large':
				modifier = Math.sqrt(this.scale.ratio)
				break

			case 'larger':
				modifier = this.scale.ratio
				break

			case 'largest':
				modifier = Math.pow(this.scale.ratio, 2)
				break

			default:
				console.error(`[ERROR] Chassis Auto-Typography: Font scale "${alias}" not found. Defaulting to root.`)
		}

		return root * modifier * multiplier
	}
	
	calculateInlineHeight (baseLineHeight, ratio = this.scale.ratio) {
		return baseLineHeight + Math.sqrt(ratio)
	}
	
	calculateInlineMarginY (baseLineHeight, ratio = this.scale.ratio) {
		return 1
	}
	
	calculateInlineMarginX (baseLineHeight, ratio = this.scale.ratio) {
		return Math.log(baseLineHeight)
	}
	
	calculateInlinePaddingX (baseLineHeight, ratio = this.scale.ratio) {
		return Math.sin(baseLineHeight)
	}

	calculateLineHeight (fontSize, viewportWidth, ratio = this.scale.ratio) {
		return (ratio - 1 / (2 * ratio) * (1 - viewportWidth / this.calculateOptimalLineWidth(fontSize))) * fontSize
	}

	calculateOptimalLineWidth (fontSize, ratio = this.scale.ratio) {
		return Math.pow(fontSize * ratio, 2)
	}

	calculateMarginBottom (lineHeight, ratio = this.scale.ratio) {
		return lineHeight / ratio
	}

	getViewportSettings (vwr) {
		let averageViewportWidth = (vwr.bounds.lower + vwr.bounds.upper) / 2
		let rules = {}

		this.fontSizeAliases.forEach((alias) => {
			let fontSize = this.calculateFontSize(alias, 1, vwr.rootFontSize)

			rules[alias] = {
				fontSize,
				lineHeight: this.calculateLineHeight(fontSize, averageViewportWidth)
			}
		})

		return rules
	}
}

module.exports = ChassisTypography
