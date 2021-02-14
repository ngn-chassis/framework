export default class ErrorUtils {
  static createError (properties) {
    let { file, line, column, css, message } = properties
    let finalMessage = 'Chassis'

    if (file) {
      finalMessage = file
    }

    if (line) {
      finalMessage += `${line}${column ? `:${column}` : ''}`
    }

    if (css) {
      finalMessage += `\n\n${line ? `${line} | ` : ''}${css}`
    }

    if (message) {
      finalMessage += '\n'

      if (!Array.isArray(message)) {
        message = [message]
      }

      message.forEach(part => {
        finalMessage += `\n${part}`
      })
    }

    return new Error(`${finalMessage}\n`)
  }
}
