export default class StringUtils {
	/**
	 * @method getUnit
	 * Get the units from a CSS Property value
	 * @param {string} value with units
	 * @return {string}
	 * @static
	 */
	static getUnits (string) {
		let match = string.match(/\D+$/)

		return match ? match[0] : null
	}

	static listValues (values) {
		let array = values

		if (typeof values === 'object') {
			array = Object.keys(values).map(key => values[key])
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
	static stripUnits (string) {
		let data = string.match(/\D+$/)
		return data.input.slice(0, data.index)
	}
}
