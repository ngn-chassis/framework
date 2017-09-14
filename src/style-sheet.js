const postcss = require('postcss')
const nesting = require('postcss-nesting')

class ChassisStyleSheet {
	constructor (chassis, tree, namespaced = true) {
		this.chassis = chassis
		this.tree = tree
		this.isNamespaced = namespaced
		
		this.css = this._generateCss()
	}

	_processAtRule (atRule) {
		let data = Object.assign({
			root: this.tree,
			atRule
		}, this.chassis.atRules.getProperties(atRule))

		this.chassis.atRules.process(data)
	}
	
	// TODO: Account for multiple "include" mixins
	_generateCss () {
		// Process imports first
		this.tree.walkAtRules('chassis', (atRule, index) => {
			if (atRule.params.startsWith('import')) {
				this._processAtRule(atRule)
			}
		})
		
		// Process all but 'include', 'new' and 'extend' mixins as those need to be
		// processed after the unnest operation to properly resolve nested selectors
		this.tree.walkAtRules('chassis', (atRule) => {
			if (!(atRule.params.startsWith('include') || atRule.params.startsWith('new') || atRule.params.startsWith('extend'))) {
				this._processAtRule(atRule)
			}
		})
		
		// in cssnext, nesting isn't handled correctly, so we're short-circuiting it
		// by handling unnesting here
		this.tree = postcss.parse(nesting.process(this.tree))
		
		// Process remaining 'new' and 'extend' mixins
		this.tree.walkAtRules('chassis', (atRule) => {
			if (atRule.params.startsWith('new') || atRule.params.startsWith('extend')) {
				this._processAtRule(atRule)
			}
		})

		// Process remaining 'include' mixins
		this.tree.walkAtRules('chassis', (atRule) => {
			if (atRule.params.startsWith('include')) {
				this._processAtRule(atRule)
			}
		})
		
		// Process all remaining mixins
		this.tree.walkAtRules('chassis', (atRule) => this._processAtRule(atRule))

		// Cleanup empty rulesets and prepend .chassis namespace to all selectors
		// except 'html' and ':root'
		this.tree.walkRules((rule) => {
			if (rule.nodes.length === 0) {
				rule.remove()
				return
			}
			
			if (rule.parent.type === 'atrule' && rule.parent.name === 'keyframes') {
				return
			}

			if (this.isNamespaced) {
				rule.selector = rule.selector === 'html' || rule.selector === ':root'  ? rule.selector.trim() : `.chassis ${rule.selector.trim()}`

				if (rule.selector.includes(',')) {
					rule.selector = rule.selector.split(',').map((selector) => selector.trim()).join(', .chassis ')
				}
			}
		})

		return this.tree
	}
}

module.exports = ChassisStyleSheet
