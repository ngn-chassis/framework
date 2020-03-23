export default class ErrorUtils {
  static createError (properties) {
		let finalMessage = ''

    if (properties.hasOwnProperty('file')) {
      finalMessage = properties.file
    }

		if (properties.hasOwnProperty('line')) {
			finalMessage += `\n       Line ${properties.line}`
		}

    if (properties.hasOwnProperty('css')) {
			finalMessage += `: ${properties.css}`
		}

    // if (properties.hasOwnProperty('mixin')) {
    //   finalMessage += `: @${properties.mixin}`
    // }

		if (properties.hasOwnProperty('message')) {
			finalMessage += `\n       ${properties.message}`
		}

		return new Error(finalMessage)
  }
}
