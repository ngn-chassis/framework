class ChassisStyleSheetMixins {
  constructor (chassis) {
    this.chassis = chassis
  }

  /**
	 * @mixin import
	 */
	import () {
		let { settings, utils } = this.chassis
    let { args, atRule, nodes, source } = arguments[0]
    
    let importPath = ''
    let file = `_${utils.files.getFileName(args[0])}`
    let path = `${utils.files.getFilePath(args[0])}`
    
    if (path) {
      importPath = `${settings.importBasePath}/${path}/${file}`
    } else {
      importPath = `${settings.importBasePath}/${file}`
    }
    
    if (!utils.files.fileExists(importPath, false)) {
      console.log(`[ERROR] Line ${source.line}: File "${file}" not found in "${settings.importBasePath}/${path}"`);
      atRule.remove()
      return
    }
    
    atRule.replaceWith(utils.files.parseStyleSheet(importPath, false))
	}
}

module.exports = ChassisStyleSheetMixins
