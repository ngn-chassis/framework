module.exports = class {
  static create (properties) {
		let finalMessage = 'Chassis StyleSheet'

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
