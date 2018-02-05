const postcss = require('postcss')
const nesting = require('postcss-nesting')
const processNot = require('postcss-selector-not')

class ChassisStyleSheet {
	constructor (chassis, tree, namespaced = true) {
		this.chassis = chassis
		this.tree = tree
		this.isNamespaced = namespaced

		Object.defineProperties(this, {
			_atRules: NGN.private({}),

			_processAtRule: NGN.privateconst((atRule) => {
				let data = Object.assign({
					root: this.tree,
					atRule
				}, this.chassis.atRules.getProperties(atRule))

				this.chassis.atRules.process(data)
			}),

			_generateNamespacedSelector: NGN.privateconst((selector) => {
				selector = selector === 'html' || selector === ':root'  ? selector.trim() : `.chassis ${selector.trim()}`

				if (selector.includes(',')) {
					selector = selector.split(',').map((chunk) => chunk.trim()).join(', .chassis ')
				}

				return selector
			}),

			_processAtRules: NGN.privateconst((type) => {
				if (this._atRules.hasOwnProperty(type)) {
					this._atRules[type].forEach((atRule) => {
						this._processAtRule(atRule)
					})
				}
			}),

			_storeAtRule: NGN.privateconst((atRule) => {
				let params = atRule.params.split(' ')
				let container = params[0]
				let containers = ['import', 'include', 'new', 'extend']

				if (containers.includes(container)) {
					if (!this._atRules.hasOwnProperty(container)) {
						this._atRules[container] = []
					}

					this._atRules[container].push(atRule)
					return
				}

				if (!this._atRules.hasOwnProperty('other')) {
					this._atRules.other = []
				}

				this._atRules.other.push(atRule)
			}),

			_storeAtRules: NGN.privateconst(() => {
				this._atRules = {}
				this.tree.walkAtRules('chassis', (atRule) => this._storeAtRule(atRule))
			})
		})
	}

	// TODO: Account for multiple "include" mixins
	get css () {
		this._storeAtRules()

		// Process imports first
		this._processAtRules('import')

		// Process all but 'include', 'new' and 'extend' mixins as those need to be
		// processed after the unnest operation to properly resolve nested selectors
		this._processAtRules('other')

		// in cssnext, nesting isn't handled correctly, so we're short-circuiting it
		// by handling unnesting here
		this.tree = postcss.parse(nesting.process(this.tree))
		this._storeAtRules()

		// Process remaining 'new', 'extend', and 'include' mixins
		this._processAtRules('new')
		this._processAtRules('extend')
		this._processAtRules('include')

		// Process remaining other mixins
		this._processAtRules('other')

		// Process nesting again
		this.tree = postcss.parse(nesting.process(this.tree))

		// Process ":not()" instances before namespace is prepended
		this.tree = postcss.parse(processNot.process(this.tree))

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
				rule.selector = this._generateNamespacedSelector(rule.selector)
			}
		})

		return this.tree
	}
}

module.exports = ChassisStyleSheet
