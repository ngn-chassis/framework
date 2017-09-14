class ChassisStringUtils {
	/**
	 * @method getUnit
	 * Get the units from a CSS Property value
	 * @param {string} value with units
	 * @return {string}
	 * @static
	 */
	static getUnit (value) {
		return value.match(/\D+$/)[0]
	}


	static listValues (values) {
		let array = values

		if (typeof values === 'object') {
			array = Object.keys(values).map((key) => values[key])
		}

		return array.map((value, index) => {
			return index === array.length - 1 ? `or "${value}"` : `"${value}"`
		}).join(', ')
	}

	/**
	 * @method stripParentheses
	 * Strip all parentheses from string
	 * @param  {string} string
	 * @return {string}
	 */
	static stripParentheses (string) {
		return string.replace(/[()]/g, '')
	}

	/**
	 * @method stripUnits
	 * Strip the units from a CSS Property value
	 * @param {string} value with units
	 * @return {string}
	 * @static
	 */
	static stripUnits (value) {
		let data = value.match(/\D+$/)
		return data.input.slice(0, data.index)
	}

	/**
	 * @method resolveVariables
	 * Resolve variables in component spec sheets
	 * @param {string} string
	 * the source string with the variable
	 * @param {object} variables
	 * properties from which to retrieve the variable's value
	 * @return {string}
	 */
	static resolveVariables (string, variables) {
		if (!string.includes('$')) {
			return string
		}

		let arr = string.split('$')

		arr.forEach((substring, index) => {
			if (substring.length === 0 || !substring.includes('(')) {
				return
			}

			let variable = substring.match(/\(([^)]+)\)/)[1]
			arr[index] = substring.replace(`(${variable})`, variables[variable])
		})

		return arr.join('')
	}
}

module.exports = ChassisStringUtils
