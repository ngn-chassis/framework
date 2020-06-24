let postcss = require('postcss')

module.exports = class ChassisCssUtils {
	/**
	 * @method createAtRule
	 * Generate new postcss at-rule AST
	 * @param {object} config
	 * @return {at-rule}
	 * @static
	 */
	static createAtRule (config) {
		return postcss.atRule(config)
	}

	/**
	 * @method createDecl
	 * Generate postcss decl AST
	 * @param {string} prop
	 * CSS Property
	 * @param {string} value
	 * CSS Property value
	 * @return {decl}
	 * @static
	 */
	static createDecl (prop, value) {
		return postcss.decl(this.createDeclObj(prop, value))
	}

	/**
	 * @method createDeclObj
	 * Utility method to reduce code repetition
	 * Generates a decl object
	 * @param {string} prop
	 * CSS Property
	 * @param {string} value
	 * CSS Property value
	 * @return {object} of shape {prop: {string}, value: {string}}
	 * @static
	 */
	static createDeclObj (prop, value) {
		return {prop, value}
	}

	/**
	 * @method createMediaQuery
	 * Generate new Media Query rule AST
	 * @param {String} params
	 * CSS Media Query parameters
	 * example: 'screen and (display-mode: fullscreen)'
	 * @param {Array} nodes
	 * CSS contents of Media Query
	 * @return {AtRule}
	 * @static
	 */
	static createMediaQuery (params, nodes) {
		return this.createAtRule({name: 'media', params, nodes})
	}

	/**
	 * @method createRoot
	 * @param {Array} nodes
	 * Nodes to populate new root element with
	 * @static
	 */
	static createRoot (nodes = []) {
		return postcss.root({nodes})
	}

	/**
	 * @method createRule
	 * Generate new postcss rule AST
	 * @param {string} selector
	 * CSS selector
	 * @param {Array} decls
	 * Declarations to add inside rule
	 * Each decl should be an object of shape {prop: {string}, value: {string}}
	 * @return {rule}
	 * @static
	 */
	static createRule (selector, decls = []) {
		let rule = postcss.rule({selector})

		if (decls.length > 0) {
			decls.forEach(decl => rule.append(postcss.decl(this.createDeclObj(decl.prop, decl.value))))
		}

		return rule
	}

	/**
	 * @method generateDeclsFromTheme
	 * Generates an array of CSS Declarations from a Chassis Theme
	 * @param  {Object} theme
	 * @return {Array} CSS Declarations
	 * @static
	 */
	static generateDeclsFromTheme (theme) {
		if (!theme.hasOwnProperty('properties')) {
			return []
		}

		return Object.keys(theme.properties).map(property => {
			return this.createDecl(property, theme.properties[property])
		})
	}

	/**
	 * @method getCommonProps
	 * @param  {Array} firstGroup
	 * @param  {Array} secondGroup
	 * @return {Array} props common to both arrays
	 * @static
	 */
	static getCommonProps (firstArr, secondArr) {
		let baseArr = []
		let refArr = []

		if (firstArr.length >= secondArr.length) {
			baseArr = secondArr
			refArr = firstArr
		} else {
			baseArr = firstArr
			refArr = secondArr
		}

		return baseArr.filter(base => {
			return refArr.some(ref => ref.prop === base.prop)
		}).map(decl => decl.prop)
	}

	/**
	 * @method getSelectorListAsArray
	 * Generates an array from a list of comma-separated CSS selectors
	 * @param  {String} list
	 * List of comma-separated CSS selectors
	 * example: 'input, textarea, [contenteditable]'
	 * @return {Array} of CSS selectors
	 * @static
	 */
	static getSelectorListAsArray (list) {
		return list.split(',').map(selector => selector.trim())
	}

	/**
	 * @method getUniqueProps
	 * @param  {Array} baseArr
	 * @param  {Array} refArr
	 * @return {Array} props unique to base array
	 * @static
	 */
	static getUniqueProps (baseArr, refArr) {
		return baseArr.filter(base => {
			return !refArr.some(ref => ref.prop === base.prop)
		}).map(decl => decl.prop)
	}

	/**
	 * @method mergeDecls
	 * Merge 2 sets of CSS Declarations into a single set. If duplicate CSS
	 * properties are present, the property value from the second argument will
	 * overwrite that of the first argument.
	 * @param  {Array} originalDecls
	 * @param  {Array} declsToMerge
	 * @return {Array} merged CSS declarations
	 * @static
	 */
	static mergeDecls (originalDecls, declsToMerge) {
		let finalDecls = originalDecls

		declsToMerge.forEach(declToMerge => {
			let index = originalDecls.findIndex(originalDecl => originalDecl.prop === declToMerge.prop)

			if (index >= 0) {
				return finalDecls[index] = declToMerge
			}

			finalDecls.push(declToMerge)
		})

		return finalDecls
	}

	/**
	 * @method stripComments
	 * Strips all comments from a CSS AST
	 * @param  {AST} tree
	 * @static
	 */
	static stripComments (tree) {
		tree.walkComments(comment => comment.remove())
	}
}
