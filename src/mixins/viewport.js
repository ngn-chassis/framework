class ChassisViewportMixins {
  constructor (chassis) {
    this.chassis = chassis
  }

  height () {
		let { settings, utils, viewport } = this.chassis
    let { atRule, args, nodes, source } = arguments[0]

		let operator = args[0]
		let height = parseInt(args[1])

		if (isNaN(height)) {
			console.error(`[ERROR] Line ${source.line}: Invalid viewport height value "${args[1]}".`)
			atRule.remove()
			return
		}

		let mediaQuery = utils.css.newMediaQuery(
			viewport.getMediaQueryParams('height', operator, height),
			nodes
		)

		atRule.replaceWith(mediaQuery)
	}

  width () {
    let { settings, utils, viewport } = this.chassis
    let { atRule, args, nodes, source } = arguments[0]

		let operator = args[0]

		if (!viewport.operatorIsValid(operator)) {
			console.error(`[ERROR] Line ${source.line}: Invalid media query operator "${operator}".`)
			atRule.remove()
			return
		}

		let width = parseInt(args[1])
		let isRange = false

		if (isNaN(width)) {
			let name = args[1]

			width = settings.viewportWidthRanges.find({name})[0]

			if (!width) {
				console.error(`[ERROR] Line ${source.line}: Viewport Width Range "${args[1]}" not found.`)
				atRule.remove()
				return
			}

			isRange = true
		}

		if (operator === 'from') {
			let secondOperator = args[2]

			if (secondOperator !== undefined) {
				if (secondOperator !== 'to') {
					console.error(`[ERROR] Line ${source.line}: Invalid second media query operator "${secondOperator}". Please use "to" instead.`)
					atRule.remove()
					return
				}

				operator = '='

				let secondWidthValue = args[3]
				let secondWidthValueIsRange = false

				if (isNaN(secondWidthValue)) {
					secondWidthValue = settings.viewportWidthRanges.find({
						name: secondWidthValue
					})[0]

					if (!secondWidthValue) {
						console.error(`[ERROR] Line ${source.line}: Viewport Width Range "${args[3]}" not found.`)
						atRule.remove()
						return
					}

					secondWidthValueIsRange = true
				}

				if (secondWidthValue) {
					width = {
						name: 'custom',
						lowerBound: isRange ? width.lowerBound : width,
						upperBound: secondWidthValueIsRange ? secondWidthValue.upperBound : secondWidthValue
					}
				}
			}
		}

		let mediaQuery = utils.css.newMediaQuery(
			viewport.getMediaQueryParams('width', operator, width),
			nodes
		)

		atRule.replaceWith(mediaQuery)
  }
}

module.exports = ChassisViewportMixins
