class ChassisStyleSheetMixins {
  constructor (chassis) {
    this.chassis = chassis

    Object.defineProperties(this, {
      _getDirectory: NGN.privateconst(path => {
        return this.chassis.utils.file.parseDirectory(path, false)
      }),

      _getImportedContent: NGN.privateconst(input => {
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
	 */
	import () {
		let { settings, utils } = this.chassis
    let { args, atRule, nodes, source } = arguments[0]
    let input = args[0]
    let dirPath = `${settings.importBasePath}/${input}`

    let content = utils.file.isDirectory(dirPath) ?
      this._getDirectory(dirPath) :
      this._getImportedContent(input)

    if (!content) {
      console.log(`[ERROR] Line ${source.line}: File "${file}" not found in "${settings.importBasePath}/${path}"`);
      atRule.remove()
      return
    }

    return atRule.replaceWith(content)
	}
}

module.exports = ChassisStyleSheetMixins
