module.exports = class {
	static get console () {
		return require('./utilities/console.js')
	}

	static get css () {
		return require('./utilities/css.js')
	}

	static get file () {
		return require('./utilities/file.js')
	}

	static get math () {
		return require('./utilities/math.js')
	}

	static get string () {
		return require('./utilities/string.js')
	}

	static get theme () {
		return require('./utilities/theme.js')
	}

	static get unit () {
		return require('./utilities/unit.js')
	}
}
