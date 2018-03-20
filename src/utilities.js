const ChassisConsoleUtils = require('./utilities/console.js')
const ChassisCssUtils = require('./utilities/css.js')
const ChassisFileUtils = require('./utilities/file.js')
const ChassisMathUtils = require('./utilities/math.js')
const ChassisStringUtils = require('./utilities/string.js')
const ChassisThemeUtils = require('./utilities/theme.js')
const ChassisUnitUtils = require('./utilities/unit.js')

class ChassisUtils {
	static get console () {
		return ChassisConsoleUtils
	}

	static get css () {
		return ChassisCssUtils
	}

	static get file () {
		return ChassisFileUtils
	}

	static get math () {
		return ChassisMathUtils
	}

	static get string () {
		return ChassisStringUtils
	}

	static get theme () {
		return ChassisThemeUtils
	}

	static get unit () {
		return ChassisUnitUtils
	}
}

module.exports = ChassisUtils
