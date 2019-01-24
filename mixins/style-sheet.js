const path = require('path')
const parseValue = require('postcss-value-parser')

module.exports = class {
  constructor (chassis) {
    Object.defineProperties(this, {
      chassis: NGN.privateconst(chassis),

      getDirectory: NGN.privateconst(path => {
        return this.chassis.utils.file.parseDirectory(path, false)
      }),

      getFileContents: NGN.privateconst(input => {
        let { settings, utils } = this.chassis

        let importPath = ''
        let file = `_${utils.file.getFileName(input)}`
        let path = `${utils.file.getFilePath(input)}`

        if (path) {
          importPath = `${settings.importBasePath}/${path}/${file}`
        } else {
          importPath = `${settings.importBasePath}/${file}`
        }

        if (!importPath.endsWith('.css')) {
          importPath += '.css'
        }

        if (utils.file.fileExists(importPath, false)) {
          return utils.file.parseStyleSheet(importPath, false)
        }
      })
    })
  }

  /**
   * @mixin import
   * Import a file or directory of files into the style sheet.
   */
  import () {
    let { chassis, getDirectory, getFileContents } = this
    let { settings, utils } = chassis
    let { args, atRule, nodes, source } = arguments[0]

    let input = args[0]
    let parsed = parseValue(input).nodes[0]
    let output = null

    output = parsed.type === 'function' && parsed.value === 'dir'
      ? getDirectory(path.join(settings.importBasePath, parsed.nodes[0].value))
      : getFileContents(parsed.value)

    if (!output) {
      throw this.chassis.utils.error.create({
  			line: source.line,
        mixin: 'import',
  			message: `Invalid argument "${input}"`
  		})
    }

    return atRule.replaceWith(output)
  }
}
