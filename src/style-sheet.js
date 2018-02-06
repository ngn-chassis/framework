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

			_generateNamespacedSelector: NGN.privateconst((selector) => {
				selector = selector === 'html' || selector === ':root'  ? selector.trim() : `.chassis ${selector.trim()}`

				if (selector.includes(',')) {
					selector = selector.split(',').map((chunk) => chunk.trim()).join(', .chassis ')
				}

				return selector
			}),

			_processAtRule: NGN.privateconst((atRule) => {
				let data = Object.assign({
					root: this.tree,
					atRule
				}, this.chassis.atRules.getProperties(atRule))

				this.chassis.atRules.process(data)
			}),

			_processAtRules: NGN.privateconst((type) => {
				if (this._atRules.hasOwnProperty(type)) {
					this._atRules[type].forEach((atRule) => {
						this._processAtRule(atRule)
					})

					delete this._atRules[type]
				}
			}),

			_processImports: NGN.privateconst(() => {
				this.tree.walkAtRules('chassis', (atRule) => {
					if (atRule.params.startsWith('import')) {
						this._processAtRule(atRule)
					}
				})
			}),

			_processNesting: NGN.privateconst(() => {
				this.tree = postcss.parse(nesting.process(this.tree))
			}),

			_processNot: NGN.privateconst(() => {
				this.tree = postcss.parse(processNot.process(this.tree))
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
		this._processImports()

		// in cssnext, nesting isn't handled correctly, so we're short-circuiting it
		// by handling unnesting here
		this._processNesting()

		// After unnesting operation, re-store at-rule references
		// TODO: Find out why this is necessary, since it seems like the nesting
		// shouldn't affect which at-rules are present.
		this._storeAtRules()

		// Process all but 'include', 'new' and 'extend' mixins as those need to be
		// processed after the unnest operation to properly resolve nested selectors
		this._processAtRules('other')

		// Process remaining 'new', 'extend', and 'include' mixins
		this._processAtRules('new')
		this._processAtRules('extend')
		this._processAtRules('include')

		// Process ":not()" instances before namespace is prepended
		this._processNot()

		this._processNesting()

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
