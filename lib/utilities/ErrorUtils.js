module.exports = class ErrorUtils {
  static createError (properties) {
		let finalMessage = 'Chassis StyleSheet'

    if (properties.hasOwnProperty('file')) {
      finalMessage = properties.file
    }

		if (properties.hasOwnProperty('line')) {
			finalMessage += ` Line ${properties.line}`
		}

    if (properties.hasOwnProperty('mixin')) {
      finalMessage += `: @chassis ${properties.mixin} mixin`
    }

		if (properties.hasOwnProperty('message')) {
			finalMessage += `: ${properties.message}`
		}

		return new Error(finalMessage)
  }
}
