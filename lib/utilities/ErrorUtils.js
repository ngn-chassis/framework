export default class ErrorUtils {
  static createError (properties) {
    let { file, line, css, message } = properties
		let finalMessage = ''

    if (file) {
      finalMessage = file
    }

		if (line) {
			finalMessage += `\n\n       Line ${line}`
		}

    if (css) {
			finalMessage += `: ${css}`
		}

		if (message) {
      finalMessage += `\n`

      if (!Array.isArray(message)) {
        message = [message]
      }

      message.forEach(part => {
        finalMessage += `\n       ${part}`
      })
		}

		return new Error(`${finalMessage}\n`)
  }
}
