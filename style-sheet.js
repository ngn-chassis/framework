let postcss = require('postcss')
let nesting = require('postcss-nesting')
let processNot = require('postcss-selector-not')
let valueParser = require('postcss-value-parser')

module.exports = (function () {
	let _private = new WeakMap()

	return class {
		constructor (chassis, tree, namespaced = true) {
			this.chassis = chassis

			_private.set(this, {
				atRules: {},
				tree,
				namespaced,

				generateNamespacedSelector: selector => {
					selector = selector === 'html' || selector === ':root'  ? selector.trim() : `.chassis ${selector.trim()}`

					if (selector.includes(',')) {
						selector = selector.split(',').map(chunk => chunk.trim()).join(', .chassis ')
					}

					return selector
				},

				processAtRule: atRule => {
					let data = Object.assign({
						root: _private.get(this).tree,
						atRule
					}, this.chassis.atRules.getProperties(atRule))

					this.chassis.atRules.process(data)
				},

				processAtRules: type => {
					if (_private.get(this).atRules.hasOwnProperty(type)) {
						_private.get(this).atRules[type].forEach(atRule => {
							_private.get(this).processAtRule(atRule)
						})

						delete _private.get(this).atRules[type]
					}
				},

				processFunctions: type => {
					_private.get(this).tree.walkDecls(decl => {
						let parsed = valueParser(decl.value)

						if (parsed.nodes.some(node => node.type === 'function')) {
							decl.value = this.chassis.functions.process({
								root: _private.get(this).tree,
								raw: decl,
								parsed
							})
						}
					})
				},

				processImports: () => {
					_private.get(this).tree.walkAtRules('chassis', atRule => {
						if (atRule.params.startsWith('import')) {
							_private.get(this).processAtRule(atRule)
						}
					})
				},

				processNesting: () => {
					_private.get(this).tree = postcss.parse(nesting.process(_private.get(this).tree))
				},

				processNot: () => {
					_private.get(this).tree = postcss.parse(processNot.process(_private.get(this).tree))
				},

				storeAtRule: atRule => {
					let params = atRule.params.split(' ')
					let container = params[0]
					let containers = ['import', 'include', 'new', 'extend']

					if (containers.includes(container)) {
						if (!_private.get(this).atRules.hasOwnProperty(container)) {
							_private.get(this).atRules[container] = []
						}

						_private.get(this).atRules[container].push(atRule)
						return
					}

					if (!_private.get(this).atRules.hasOwnProperty('other')) {
						_private.get(this).atRules.other = []
					}

					_private.get(this).atRules.other.push(atRule)
				},

				storeAtRules: () => {
					_private.get(this).atRules = {}
					_private.get(this).tree.walkAtRules('chassis', atRule => _private.get(this).storeAtRule(atRule))
				}
			})
		}

		// TODO: Account for multiple "include" mixins
		get css () {
			let tasks = new NGN.Tasks()

			_private.get(this).processImports()
			_private.get(this).processNesting()

			_private.get(this).storeAtRules()

			// Process all but 'include', 'new' and 'extend' mixins as those need to be
			// processed after the unnest operation to properly resolve nested selectors
			_private.get(this).processAtRules('other')

			// Process remaining 'new', 'extend', and 'include' mixins
			_private.get(this).processAtRules('new')
			_private.get(this).processAtRules('extend')
			_private.get(this).processAtRules('include')

			// Process ":not()" instances before namespace is prepended
			_private.get(this).processNot()

			_private.get(this).processNesting()
			_private.get(this).processFunctions()

			// Cleanup empty rulesets and prepend .chassis namespace to all selectors
			// except 'html' and ':root'
			_private.get(this).tree.walkRules(rule => {
				if (rule.nodes.length === 0) {
					rule.remove()
					return
				}

				if (rule.parent.type === 'atrule' && rule.parent.name === 'keyframes') {
					return
				}

				if (_private.get(this).namespaced) {
					rule.selector = _private.get(this).generateNamespacedSelector(rule.selector)
				}
			})

			return _private.get(this).tree
		}
	}
})()
