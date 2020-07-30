import postcss from 'postcss'

export default class CSSUtils {
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
	 * @method createComment
	 * Generate new postcss comment AST
	 * @param {string} text
	 * @return {comment}
	 * @static
	 */
	static createComment (text) {
		return postcss.comment({ text })
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

		if (typeof decls === 'string') {
			rule.append(decls)
		} else if (Array.isArray(decls) && decls.length > 0) {
			decls.forEach(decl => rule.append(postcss.decl(this.createDeclObj(decl.prop, decl.value))))
		}

		return rule
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
	static mergeDecls (oldDecls, newDecls) {
		return newDecls.reduce((final, newDecl) => {
			let index = final.findIndex(decl => decl.prop === newDecl.prop)

			if (index >= 0) {
				// final[index].replaceWith(newDecl.clone())
				final.splice(index, 1, newDecl.clone())
			} else {
				final.push(newDecl.clone())
			}

			return final
		}, [...oldDecls.map(decl => decl.clone())])
	}
}
