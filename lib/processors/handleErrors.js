import postcss from 'postcss'
import ErrorUtils from '../utilities/ErrorUtils.js'

export default postcss.plugin('handle-errors', () => (root, result) => new Promise((resolve, reject) => {
  let warnings = result.warnings()

  if (warnings.length === 0) {
    return resolve(root)
  }

  let warning = warnings[0]

  reject(ErrorUtils.createError({
    file: result.root.source.input.file,
    line: warning.line,
    column: warning.column,
    message: warning.text
  }))
}))
