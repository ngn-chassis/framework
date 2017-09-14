class ChassisViewport {
	constructor (chassis) {
		this.chassis = chassis
		this.validOperators = ['<', '<=', '=', '>=', '>', 'from', 'to']
	}

	operatorIsValid (operator) {
		return this.validOperators.includes(operator)
	}

	getMediaQueryParams (dimension, operator, value) {
		let { settings } = this.chassis
		let query

		let isRange = typeof value === 'object'
		let rangeIsMax = value === settings.viewportWidthRanges.last

		switch (operator) {
			case '<':
				query = `(max-${dimension}: ${isRange ? value.lowerBound - 1 : value - 1}px)`
				break

			case 'to':
			case '<=':
				query = `(max-${dimension}: ${isRange ? value.upperBound : value}px)`
				break

			case '=':
				if (isRange) {
					query = `(min-${dimension}: ${value.lowerBound}px) and (max-${dimension}: ${rangeIsMax ? value.upperBound - 1 : value.upperBound}px)`
				} else {
					query = `(${dimension}: ${value}px)`
				}
				break

			case 'from':
			case '>=':
				query = `(min-${dimension}: ${isRange ? value.lowerBound: value}px)`
				break

			case '>':
				query = `(min-${dimension}: ${isRange ? value.upperBound + 1 : value + 1}px)`
				break

			default:
				console.error(`[ERROR] Chassis Media Query: Unknown operator "${operator}". Please use "<", "<=", "=", ">", or ">=".`)
				return ''
		}

		return `screen and ${query}`
	}

	getWidthRanges (string) {
		let { settings } = this.chassis

		let spec = string.split(' ').map((entry) => isNaN(parseInt(entry)) ? entry : parseInt(entry))
		let firstEntry = spec[0]
		let lastEntry = spec[spec.length - 1]

		if (typeof firstEntry === 'string') {
			spec.unshift(0)
		}

		if (typeof firstEntry === 'number' && firstEntry !== 0) {
			spec = [0, 'min', ...spec]
		}

		if (typeof lastEntry === 'number' && lastEntry > settings.layout.maxWidth) {
			spec.push('max')
		}

		let vwrs = []

		for (let i = 0; i < spec.length; i += 2) {
			let lowerBound = spec[i]

			if (lowerBound < settings.layout.maxWidth) {
				vwrs.push({
					name: spec[i + 1],
					lowerBound,
					upperBound: spec[i + 2] || settings.layout.maxWidth
				})
			}
		}

		return vwrs
	}
}

module.exports = ChassisViewport
