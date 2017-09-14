const ChassisConsoleUtils = require('./utilities/console.js')
const ChassisCssUtils = require('./utilities/css.js')
const ChassisFileUtils = require('./utilities/files.js')
const ChassisStringUtils = require('./utilities/string.js')
const ChassisThemeUtils = require('./utilities/theme.js')
const ChassisUnitUtils = require('./utilities/units.js')

class ChassisUtils {
	static get array () {
		return ChassisArrayUtils
	}
	
	static get console () {
		return ChassisConsoleUtils
	}

	static get css () {
		return ChassisCssUtils
	}

	static get files () {
		return ChassisFileUtils
	}

	static get string () {
		return ChassisStringUtils
	}
	
	static get theme () {
		return ChassisThemeUtils
	}

	static get units () {
		return ChassisUnitUtils
	}
}

module.exports = ChassisUtils
