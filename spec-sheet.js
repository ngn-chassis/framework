let postcss = require('postcss')
let nesting = require('postcss-nesting')

module.exports = class {
	constructor (chassis, type, spec, instance) {
		this.type = type
		this.states = []

		Object.defineProperties(this, {
			chassis: NGN.privateconst(chassis),
			spec: NGN.privateconst(spec),
			overrides: NGN.privateconst(NGN.coalesce(instance.overrides)),

			applyCustomizedState: NGN.privateconst((state, customState) => {
				let { utils } = chassis

				if (!this.states.includes(customState.params)) {
					console.warn(`[WARNING] Chassis "${this.type}" component does not support "${customState.params}" state. Discarding...`)
					return
				}

				let customRules = customState.nodes.filter(node => node.type === 'rule')
				// customRules = postcss.parse(nesting.process(customRules)).nodes

				let customDecls = customState.nodes.filter(node => node.type === 'decl')
				let overrides = null

				if (this.overrides) {
					overrides = this.generateOverrides(this.overrides, state)
				}

				state.walkRules((rule, index) => {
					// Initial state is always first
					if (index === 0) {
						this.mergeDecls(rule, customDecls)

						if (overrides) {
							this.mergeDecls(rule, overrides)
						}
					}

					// Merge any rules that are duplicated in the default state and the custom state
					let customRuleIndex

					let match = customRules.find((customRule, i) => {
						customRuleIndex = i
						return customRule.selector.replace('&', '').trim() === rule.selector.replace('$(selector)', '').trim()
					})

					if (match) {
						customRules.splice(customRuleIndex, 1)
						this.mergeRules(rule, match)
					}
				})

				customRules.forEach(customRule => {
					customRule.selector = `${state.nodes[0].selector} ${customRule.selector.replace('&', '').trim()}`
				})

				state.nodes.push(...customRules)
			}),

			findMatchingState: NGN.privateconst((state, customSpec) => {
				let customState = null

				customSpec.walkAtRules('state', atRule => {
					if (atRule.params === state.params) {
						customState = atRule
					}
				})

				return customState
			}),

			generateCustomizedState: NGN.privateconst((state, customState, cb) => {
				let { utils } = chassis

				if (!this.states.includes(customState.params)) {
					console.warn(`[WARNING] Chassis "${this.type}" component does not support "${customState.params}" state. Discarding...`)
					return
				}

				let customRules = customState.nodes.filter(node => node.type === 'rule')
				let customDecls = customState.nodes.filter(node => node.type === 'decl')
				let customAtRules = customState.nodes.filter(node => node.type === 'atrule')

				state.walkRules((rule, index) => {
					if (index === 0) {
						rule.nodes = customDecls
						return
					}

					let customRuleIndex

					let match = customRules.find((customRule, i) => {
						customRuleIndex = i
						return customRule.selector.replace('&', '').trim() === rule.selector.replace('$(selector)', '').trim()
					})

					if (match) {
						customRules.splice(customRuleIndex, 1)
						rule.nodes = match.nodes.filter(node => node.type === 'decl')
					} else {
						rule.remove()
					}
				})

				cb && cb()
			}),

			generateCustomTemplate: NGN.privateconst(customSpec => {
				let { utils } = chassis
				let root = utils.css.createRoot([])

				this.spec.walkAtRules(state => {
					switch (state.name) {
						case 'state':
							let customState = this.findMatchingState(state, customSpec)

							if (!customState) {
								return
							}

							this.generateCustomizedState(state, customState, result => {
								state.nodes.forEach(node => root.append(node))
							})
							break

						case 'legacy':

							break

						default:
							return
					}
				})

				return root
			}),

			generateOverrides: NGN.privateconst((type, state) => {
				let { componentOverrides, theme, utils } = chassis

				if (!componentOverrides.contains(type)) {
					return
				}

				let stateOverrides = componentOverrides.getState(type, state.params)

				if (!stateOverrides) {
					return
				}

				let defaultTheme = theme.getComponent(this.type)
				let initialState = defaultTheme['initial']
				let currentState = defaultTheme[state.params]

				let overridableDecls = utils.css.generateDeclsFromTheme(stateOverrides)
				let initialStateDecls = utils.css.generateDeclsFromTheme(initialState)
				let currentStateDecls = utils.css.generateDeclsFromTheme(currentState)
				let uniqueOverridableDecls = utils.css.getUniqueProps(overridableDecls, currentStateDecls)

				// TODO: Handle nested rulesets
				// let defaultRules = theme.getRules(defaultTheme)
				// let stateRules = theme.getRules(stateTheme)

				if (state.params === 'initial') {
					return uniqueOverridableDecls.map(prop => utils.css.createDecl(prop, 'initial'))
				}

				let overrides = []

				// Props common between link.${state} and component.${state}
				let commonDecls = utils.css.getCommonProps(overridableDecls, currentStateDecls)

				// If both link.${state} AND component.initial themes include a property,
				// AND it is not already included in the component.${state} theme, add this override:
				// property: component.initial value;
				if (commonDecls.length > 0) {
					let initialOverrides = commonDecls.map(prop => {
						return currentStateDecls.find(decl => decl.prop === prop)
					}).filter(Boolean)

					overrides.push(...initialOverrides)
				}

				// If a property is included in link.${state} theme but not default button theme,
				// AND it is NOT already included in the button.${state} theme,
				// unset it in ${state} button theme
				if (uniqueOverridableDecls.length > 0) {
					let unset = uniqueOverridableDecls.filter(prop => {
						return !commonDecls.includes(prop)
					}).filter(prop => {
						return !currentStateDecls.some(decl => decl.prop === prop)
					})

					// Check for properties in the default theme which should be applied
					// instead of unsetting the property, and if present, add them to overrides
					let indexesToRemove = []

					unset.forEach((prop, index) => {
						let matchInDefaultDecls = initialStateDecls.find(decl => decl.prop === prop)

						if (matchInDefaultDecls) {
							indexesToRemove.push(index)
							overrides.push(matchInDefaultDecls)
						}
					})

					// Remove properties from unset if they are already present in the default theme
					indexesToRemove.forEach(index => {
						unset.splice(index, 1)
					})

					if (unset.length > 0) {
						overrides.push(...unset.map(prop => {
							// "unset" is not supported in IE11, so we're using "initial"
							// These properties are guaranteed to be inherited since they are
							// applied to a tags- hence, even if this value were set to "unset"
							// it would always evaluate to "initial" anyway
							return utils.css.createDecl(prop, 'initial')
						}))
					}
				}

				return overrides.length > 0 ? overrides : null
			}),

			generateTemplate: NGN.privateconst((spec = null) => {
				let { utils } = chassis
				let root = utils.css.createRoot([])

				this.spec.walkAtRules(atRule => {
					switch (atRule.name) {
						case 'state':
							if (spec) {
								let customState = this.findMatchingState(atRule, spec)

								if (!customState) {
									return
								}

								this.applyCustomizedState(atRule, customState)
							}

							return atRule.nodes.forEach(node => root.append(node.clone()))

						case 'legacy':
							return atRule.nodes.forEach(node => root.append(node.clone()))

						default:
							return
					}
				})

				return root
			}),

			mergeDecls: NGN.privateconst((rule, customDecls) => {
				rule.walkDecls(decl => {
					let index

					let match = customDecls.find((customDecl, i) => {
						index = i
						return customDecl.prop === decl.prop
					})

					if (match) {
						customDecls.splice(index, 1)
						decl.replaceWith(match)
					}
				})

				rule.nodes.push(...customDecls)
			}),

			mergeRules: NGN.privateconst((rule, custom) => {
				let customRules = custom.nodes.filter(node => node.type === 'rule')
				let customDecls = custom.nodes.filter(node => node.type === 'decl')

				this.mergeDecls(rule, customDecls)
			}),

			processAtRule: NGN.privateconst(atRule => {
				let data = Object.assign({
					root: this.tree,
					atRule
				}, chassis.atRules.getProperties(atRule))

				chassis.atRules.process(data)
			}),

			resolveVariables: NGN.privateconst((root, variables = this.variables) => {
				let { utils } = chassis

				root = postcss.parse(nesting.process(root))

				root.walkRules(rule => {
					rule.selector = this.variables.selectors.map(selector => {
						return utils.string.resolveVariables(rule.selector, {selector})
					}).join(', ')

					rule.walkDecls(decl => {
						decl.prop = utils.string.resolveVariables(decl.prop, this.variables)
						decl.value = utils.string.resolveVariables(decl.value, this.variables)
					})
				})

				return root
			})
		})

		// Strip comments from spec sheet
		chassis.utils.css.stripComments(this.spec)

		// Get selector list from first line of spec sheet
		this.selectors = chassis.utils.css.getSelectorListAsArray(this.spec.nodes[0].selector)

		if (chassis.componentExtensions.contains(type)) {
			this.selectors.push(...chassis.componentExtensions.get(type).selectors)
		}

		this.variables = Object.assign(NGN.coalesce(instance.variables, {}), {
			selectors: this.selectors
		})

		// Store states
		this.spec.walkAtRules('state', atRule => this.states.push(atRule.params))
	}

	get css () {
		let template = this.generateTemplate()
		return this.resolveVariables(template)
	}

	getCustomCss (customSpec) {
		let template = this.generateCustomTemplate(customSpec)

		let customVariables = Object.assign(this.variables, {
			selectors: customSpec.nodes[0].selector.split(',')
		})

		let resolved = this.resolveVariables(template, customVariables)

		resolved.walkAtRules('chassis', atRule => this.processAtRule(atRule))

		return resolved
	}

	getUnthemedCss (customSpec) {
		let template = this.generateTemplate(customSpec)

		let customVariables = Object.assign(this.variables, {
			selectors: customSpec.nodes[0].selector.split(',')
		})

		let resolved = this.resolveVariables(template, customVariables)

		resolved.walkAtRules('chassis', atRule => this.processAtRule(atRule))

		return resolved
	}

	getThemedCss (theme) {
		let template = this.generateTemplate(theme)
		let resolved = this.resolveVariables(template)

		resolved.walkAtRules('chassis', atRule => this.processAtRule(atRule))

		return resolved
	}
}
