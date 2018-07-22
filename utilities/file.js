const fs = require('fs')
const path = require('path')
const postcss = require('postcss')

class ChassisFileUtils {
	/**
	 * @method fileExists
	 * Determine whether or not a filepath points to an existing file
	 * @param {string} filepath
	 * @static
	 */
	static fileExists (filepath, relative = true) {
		if (relative) {
			filepath = this.resolve(filepath)
		}

		return fs.existsSync(filepath)
	}

	static getFilePath (filepath) {
		return filepath.substring(0, filepath.lastIndexOf("/"))
	}
	
	static getFileName (filepath) {
		return path.basename(filepath)
	}
	
	static getFileExtension (filepath) {
		return path.extname(filepath)
	}
	
	/**
	 * @method isDirectory
	 * Determine whether or not a filepath points to a directory
	 * @param {string} filepath
	 * @static
	 */
	static isDirectory (filepath) {
		if (fs.existsSync(filepath)) {
			return fs.lstatSync(filepath).isDirectory()
		}

		return false
	}
	
	/**
	 * @method parseDirectory
	 * Parse all style sheets in a given directory
	 * @param {string} dirpath
	 * @param {boolean} relative
	 * Whether or not dirpath is relative (false means absolute)
	 * @static
	 */
	static parseDirectory (dirpath, relative = true) {
		if (relative) {
			dirpath = this.resolve(dirpath)
		}

		let files = fs.readdirSync(dirpath).map(file => `${dirpath}/${file}`)
		return this.parseStyleSheets(files, false)
	}

	/**
	 * @method parseStyleSheet
	 * Parse a CSS style sheet into a postcss AST
	 * @param {string} filepath
	 * @return {AST}
	 * @static
	 */
	static parseStyleSheet (filepath, relative = true) {
		if (relative) {
			filepath = this.resolve(filepath)
		}

		return postcss.parse(fs.readFileSync(filepath))
	}

	/**
	 * @method parseStyleSheets
	 * Parse an array of CSS style sheets into a single postcss AST
	 * @param {array} filepaths
	 * @return {AST}
	 * @static
	 */
	static parseStyleSheets (filepaths, relative = true) {
		let output = this.parseStyleSheet(filepaths[0], relative)
		let remainingFilepaths = filepaths.slice(1)

		remainingFilepaths.forEach(path => {
			output.append(this.parseStyleSheet(path, relative))
		})

		return output
	}
	
	static pathIsAbsolute (filepath) {
		return path.isAbsolute(filepath)
	}
	
	/**
	 * @method resolve
	 * Resolve a relative path
	 * @param {string} filepath
	 * @static
	 */
	static resolve (filepath) {
		return path.join(__dirname, filepath)
	}
}

module.exports = ChassisFileUtils
