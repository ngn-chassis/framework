module.exports = (function () {
	let _private = new WeakMap()

	return class {
		constructor (chassis) {
			_private.set(this, {
				chassis,
				validOperators: ['<', '<=', '=', '>=', '>', 'from', 'to'],

				getLessThanQuery: (dimension, isRange, isEnv, value, buffer = 0) => {
					let prop = `max-${dimension}`

					if (!isEnv) {
						if (isRange) {
							value = value.lowerBound

							if (buffer !== 0) {
								value += buffer
							}
						}
					}

					return `(${prop}: ${value - 1}px)`
				},

				getLessThanOrEqualQuery: (dimension, isRange, isEnv, value, buffer = 0) => {
					let prop = `max-${dimension}`

					if (!isEnv) {
						if (isRange) {
							value = value.lowerBound
						}

						if (buffer !== 0) {
							value += buffer
						}
					}

					return `(${prop}: ${value}px)`
				},

				getEqualQuery: (dimension, value, buffer = 0) => {
					let props = [
						`min-${dimension}`,
						`max-${dimension}`
					]

					let values = [
						value.lowerBound,
						value.upperBound
					]

					if (buffer < 0) {
						values[0] += buffer
					}

					if (buffer > 0) {
						values[1] += buffer
					}

					return `(${props[0]}: ${values[0]}px) and (${props[1]}: ${values[1]}px)`
				},

				getGreaterThanOrEqualQuery: (dimension, isRange, isEnv, value, buffer = 0) => {
					let prop = `min-${dimension}`

					if (!isEnv) {
						if (isRange) {
							value = value.lowerBound
						}

						if (buffer !== 0) {
							value += buffer
						}
					}

					return `(${prop}: ${value}px)`
				},

				getGreaterThanQuery: (dimension, isRange, isEnv, value, buffer = 0) => {
					let prop = `min-${dimension}`

					if (!isEnv) {
						if (isRange) {
							value = value.upperBound
						}

						if (buffer !== 0) {
							value += buffer
						}
					}

					return `(${prop}: ${value + 1}px)`
				}
			})
		}

		operatorIsValid (operator) {
			return _private.get(this).validOperators.includes(operator)
		}

		getMediaQueryParams (dimension, operator, value, buffer = 0) {
			let { settings } = _private.get(this).chassis
			let query

			let isRange = typeof value === 'object'
			let rangeIsMax = value === settings.viewportWidthRanges.last

			let isEnv = isRange
				? false
				: (
					typeof value === 'string'
					? value.startsWith('env(')
					: false
				)

			switch (operator) {
				case '<':
					query = _private.get(this).getLessThanQuery(dimension, isRange, isEnv, value, buffer)
					break

				case 'to':
				case '<=':
					query = _private.get(this).getLessThanOrEqualQuery(dimension, isRange, isEnv, value, buffer)
					break

				case '=':
					if (isRange) {
						query = _private.get(this).getEqualQuery(dimension, value, buffer)
					} else {
						query = `(${dimension}: (${isEnv ? value : `${value}px`}))`
					}
					break

				case 'from':
				case '>=':
					query = _private.get(this).getGreaterThanOrEqualQuery(dimension, isRange, isEnv, value, buffer)
					break

				case '>':
					query = _private.get(this).getGreaterThanQuery(dimension, isRange, isEnv, value, buffer)
					break

				default:
					console.error(`[ERROR] Chassis Media Query: Unknown operator "${operator}". Please use "<", "<=", "=", ">", or ">=".`)
					return ''
			}

			return `screen and ${query}`
		}

		getWidthRanges (string) {
			let { settings } = _private.get(this).chassis

			let spec = string.split(' ').map(entry => isNaN(parseInt(entry)) ? entry : parseInt(entry))
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
})()
