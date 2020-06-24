let fs = require('fs')
let path = require('path')
let postcss = require('postcss')

module.exports = class ChassisFileUtils {
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

	/**
	 * @method getFilePath
	 * Strips the file name and extension from the provided path
	 * @param  {string} filepath
	 * @return {string}
	 * @static
	 */
	static getFilePath (filepath) {
		return filepath.substring(0, filepath.lastIndexOf("/"))
	}

	/**
	 * @method getFileName
	 * Returns the name of the file at the provided path
	 * @param  {string} filepath
	 * @return {string}
	 * @static
	 */
	static getFileName (filepath) {
		return path.basename(filepath)
	}

	/**
	 * @method getFileExtension
	 * Returns the extension name of a file.
	 * @param  {string} filepath
	 * Path to file.
	 * @return {string}
	 */
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
	 * Parse all style sheets in a directory. This method does NOT parse subdirectories.
	 * @param {string} dir
	 * Directory to query for stylesheets.
	 * @param {boolean} relative
	 * Whether or not dirpath is relative (false means absolute)
	 * @static
	 */
	static parseDirectory (dir, relative = true) {
		dir = relative ? this.resolve(dir) : dir

		let files = fs.readdirSync(dir)
			.filter(item => !this.isDirectory(item))
			.filter(file => this.getFileExtension(file) === '.css')
			.map(file => path.join(dir, file))

		return files.length > 0 ? this.parseStyleSheets(files, false) : ''
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
	 * Parses an array of CSS style sheets into a single postcss AST
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

	/**
	 * @method pathIsAbsolute
	 * Determines whether a path is absolute (true) or relative (false)
	 * @param  {string} filepath
	 * @return {boolean}
	 * @static
	 */
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
