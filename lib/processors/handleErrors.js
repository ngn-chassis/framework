import postcss from 'postcss'
import ErrorUtils from '../utilities/ErrorUtils.js'
import Config from '../data/Config.js'

export default postcss.plugin('handle-errors', () => (root, result) => new Promise((resolve, reject) => {
  let warnings = result.warnings()

  if (warnings.length === 0) {
    return resolve(root)
  }

  let warning = warnings[0]

  // postcss-custom-media returns a message with the name of the offending range in single quotes
  let range = warning.text.match(/'([^']+)'/)[1]

  let maxNameLength = Math.max(...Config.generatedRanges.map(range => range.name.length))
  let maxMinLength = Config.generatedRanges.reduce((acc, range) => {
    let { min } = range.bounds

    if (!min) {
      return acc
    }

    let { length } = min.toString()

    if (length <= acc) {
      return acc
    }

    return length
  }, 0)

  reject(ErrorUtils.createError({
    file: result.root.source.input.file,
    line: warning.line,
    column: warning.column,
    message: [
      `Unrecognized viewport range "${range}". Available viewport ranges:`,
      '',
      `  Name${' '.repeat(maxNameLength)}  Min${' '.repeat(maxMinLength)}Max`,
      `${'-'.repeat(maxNameLength + 19)}`,
      ...Config.generatedRanges.map(range => {
        let { min, max } = range.bounds
        return `  --${range.name}${' '.repeat(maxNameLength - range.name.length + 4)}${min ? min : '---'}${' '.repeat(maxMinLength - (min ? min.toString().length : 3))}   ${max ? max : '---'}`
      })
    ]
  }))
}))
