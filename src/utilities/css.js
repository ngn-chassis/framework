const postcss = require('postcss')

class ChassisCssUtils {
	static generateDeclsFromTheme (theme) {
		if (!theme.hasOwnProperty('properties')) {
			return []
		}
	
		return Object.keys(theme.properties).map((property) => {
			return this.newDecl(property, theme.properties[property])
		})
	}
	
	/**
	 * @method getCommonProps
	 * @param  {array} firstGroup
	 * @param  {array} secondGroup
	 * @return {array} props common to both arrays
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
		
		return baseArr.filter((base) => {
			return refArr.some((ref) => ref.prop === base.prop)
		}).map((decl) => decl.prop)
	}
	
	/**
	 * @method getUniqueProps
	 * @param  {array} baseArr
	 * @param  {array} refArr
	 * @return {array} props unique to base array
	 */
	static getUniqueProps (baseArr, refArr) {
		return baseArr.filter((base) => {
			return !refArr.some((ref) => ref.prop === base.prop)
		}).map((decl) => decl.prop)
	}
	
	static mergeDecls (originalDecls, newDecls) {
		let finalDecls = originalDecls
		
		newDecls.forEach((newDecl) => {
			let index = originalDecls.findIndex((originalDecl) => {
				return originalDecl.prop === newDecl.prop
			})
			
			if (index >= 0) {
				finalDecls[index] = newDecl
				return
			}
			
			finalDecls.push(newDecl)
		})
		
		return finalDecls
	}
	
	/**
	 * @method newAtRule
	 * Generate new postcss at-rule AST
	 * @param {object} config
	 * @return {at-rule}
	 * @static
	 */
	static newAtRule (config) {
		return postcss.atRule(config)
	}

	/**
	 * @method newDecl
	 * Generate postcss decl AST
	 * @param {string} key
	 * CSS Property
	 * @param {string} value
	 * CSS Property value
	 * @return {decl}
	 * @static
	 */
	static newDecl (key, value) {
		return postcss.decl(this.newDeclObj(key, value))
	}

	/**
	 * @method newDeclObj
	 * Utility method to reduce code repetition
	 * Generate decl object
	 * @param {string} key
	 * CSS Property
	 * @param {string} value
	 * CSS Property value
	 * @return {object} of shape {prop: {string}, value: {string}}
	 * @static
	 */
	static newDeclObj (key, value) {
		return {
			prop: key,
			value
		}
	}

	/**
	 * @method newRoot
	 * @param {array} nodes
	 * Nodes to populate new root element with
	 * @static
	 */
	static newRoot (nodes = []) {
		return postcss.root({nodes})
	}

	/**
	 * @method newRule
	 * Generate new postcss rule AST
	 * @param {string} selector
	 * CSS selector
	 * @param {array} decls
	 * Declarations to add inside rule
	 * Each decl should be an object of shape {prop: {string}, value: {string}}
	 * @return {rule}
	 * @static
	 */
	static newRule (selector, decls = []) {
		let rule = postcss.rule({selector})
		
		if (decls.length > 0) {
			decls.forEach(decl => {
				rule.append(postcss.decl(this.newDeclObj(decl.prop, decl.value)))
			})
		}

		return rule
	}

	static newMediaQuery (params, nodes) {
		return this.newAtRule({name: 'media', params, nodes})
	}
	
	static stripComments (tree) {
		tree.walkComments((comment) => {
			comment.remove()
		})
	}
}

module.exports = ChassisCssUtils
