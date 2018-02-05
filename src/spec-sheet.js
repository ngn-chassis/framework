const postcss = require('postcss')
const nesting = require('postcss-nesting')
const processNot = require('postcss-selector-not')

class ChassisSpecSheet {
	constructor (chassis, type, spec, instance) {
		this.chassis = chassis
		this.type = type
		this.spec = spec
		this.overrides = NGN.coalesce(instance.overrides)
		this.states = []

		// Strip comments from spec sheet
		this.spec.walkComments((comment) => comment.remove())

		// Get selector list from first line of spec sheet
		this.selectors = this.spec.nodes[0].selector.split(',')

		if (chassis.componentExtensions.hasOwnProperty(type)) {
      this.selectors.push(...chassis.componentExtensions[type]);
		}

		this.variables = Object.assign(NGN.coalesce(instance.variables, {}), {
			selectors: this.selectors
		})

		// Store states
		this.spec.walkAtRules('state', (atRule) => this.states.push(atRule.params))

		Object.defineProperties(this, {
			_applyCustomizedState: NGN.privateconst((state, customState) => {
				let { utils } = this.chassis

				if (!this.states.includes(customState.params)) {
					console.warn(`[WARNING] Chassis "${this.type}" component does not support "${customState.params}" state. Discarding...`)
					return
				}

				let customRules = customState.nodes.filter((node) => node.type === 'rule')
				let customDecls = customState.nodes.filter((node) => node.type === 'decl')
				let overrides = null

				if (this.overrides) {
					overrides = this._generateOverrides(this.overrides, state)
				}

				state.walkRules((rule, index) => {
					// Default state is always first
					if (index === 0) {
						this._mergeDecls(rule, customDecls)

						if (overrides) {
							this._mergeDecls(rule, overrides)
						}
					}

					let customRuleIndex

					let match = customRules.find((customRule, i) => {
						customRuleIndex = i
						return customRule.selector.replace('&', '').trim() === rule.selector.replace('$(selector)', '').trim()
					})

					if (match) {
						customRules.splice(customRuleIndex, 1)
						this._mergeRules(rule, match)
					}
				})

				customRules.forEach((customRule) => {
					customRule.selector = `${state.nodes[0].selector} ${customRule.selector.replace('&', '').trim()}`
				})

				state.nodes.push(...customRules)
			}),

			_findMatchingState: NGN.privateconst((state, customSpec) => {
				let customState = null

				customSpec.walkAtRules('state', (atRule) => {
					if (atRule.params === state.params) {
						customState = atRule
					}
				})

				return customState
			}),

			_generateCustomizedState: NGN.privateconst((state, customState, cb) => {
				let { utils } = this.chassis

				if (!this.states.includes(customState.params)) {
					console.warn(`[WARNING] Chassis "${this.type}" component does not support "${customState.params}" state. Discarding...`)
					return
				}

				let customRules = customState.nodes.filter((node) => node.type === 'rule')
				let customDecls = customState.nodes.filter((node) => node.type === 'decl')
				let customAtRules = customState.nodes.filter((node) => node.type === 'atrule')

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
						rule.nodes = match.nodes.filter((node) => node.type === 'decl')
					} else {
						rule.remove()
					}
				})

				cb && cb()
			}),

			_generateCustomTemplate: NGN.privateconst((customSpec) => {
				let { utils } = this.chassis
				let root = utils.css.newRoot([])

				this.spec.walkAtRules((state) => {
					switch (state.name) {
						case 'state':
							let customState = this._findMatchingState(state, customSpec)

							if (!customState) {
								return
							}

							this._generateCustomizedState(state, customState, (result) => {
								state.nodes.forEach((node) => root.append(node))
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

			_generateOverrides: NGN.privateconst((type, state) => {
				let { componentOverrides, theme, utils } = this.chassis
				let stateOverrides = componentOverrides[type][state.params]

				if (!stateOverrides) {
					return
				}

				let defaultTheme = theme.getComponent(this.type)
				let defaultState = defaultTheme['default']
				let currentState = defaultTheme[state.params]

				let overridableDecls = utils.css.generateDeclsFromTheme(stateOverrides)
				let defaultStateDecls = utils.css.generateDeclsFromTheme(defaultState)
				let currentStateDecls = utils.css.generateDeclsFromTheme(currentState)
				let uniqueOverridableDecls = utils.css.getUniqueProps(overridableDecls, currentStateDecls)

				// TODO: Handle nested rulesets
		    // let defaultRules = theme.getRules(defaultTheme)
		    // let stateRules = theme.getRules(stateTheme)

				if (state.params === 'default') {
					return uniqueOverridableDecls.map((prop) => utils.css.newDecl(prop, 'initial'))
				}

				let overrides = []

				// Props common between link.${state} and component.${state}
				let commonDecls = utils.css.getCommonProps(overridableDecls, currentStateDecls)

				// If both link.${state} AND component.default themes include a property,
				// AND it is not already included in the component.${state} theme, add this override:
				// property: component.default value;
				if (commonDecls.length > 0) {
					let defaultOverrides = commonDecls.map((prop) => {
						return currentStateDecls.find((decl) => decl.prop === prop)
					}).filter((entry) => entry !== undefined)

					overrides.push(...defaultOverrides)
				}

				// If a property is included in link.${state} theme but not default button theme,
				// AND it is NOT already included in the button.${state} theme,
				// unset it in ${state} button theme
				if (uniqueOverridableDecls.length > 0) {
					let unset = uniqueOverridableDecls.filter((prop) => {
						return !commonDecls.includes(prop)
					}).filter((prop) => {
						return !currentStateDecls.some((decl) => decl.prop === prop)
					})

					// Check for properties in the default theme which should be applied
					// instead of unsetting the property, and if present, add them to overrides
					let indexesToRemove = []

					unset.forEach((prop, index) => {
						let matchInDefaultDecls = defaultStateDecls.find((decl) => decl.prop === prop)

						if (matchInDefaultDecls) {
							indexesToRemove.push(index)
							overrides.push(matchInDefaultDecls)
						}
					})

					// Remove properties from unset if they are already present in the default theme
					indexesToRemove.forEach((index) => {
						unset.splice(index, 1)
					})

					if (unset.length > 0) {
						overrides.push(...unset.map((prop) => {
							// "unset" is not supported in IE11, so we're using "initial"
							// These properties are guaranteed to be inherited since they are
							// applied to a tags- hence, even if this value were set to "unset"
							// it would always evaluate to "initial" anyway
							return utils.css.newDecl(prop, 'initial')
						}))
					}
				}

				return overrides.length > 0 ? overrides : null
			}),

			_generateTemplate: NGN.privateconst((customSpec = null) => {
				let { utils } = this.chassis
				let root = utils.css.newRoot([])

				this.spec.walkAtRules((atRule) => {
					switch (atRule.name) {
						case 'state':
							if (customSpec) {
								let customState = this._findMatchingState(atRule, customSpec)

								if (!customState) {
									return
								}

								this._applyCustomizedState(atRule, customState)
							}

							return atRule.nodes.forEach((node) => root.append(node.clone()))

						case 'legacy':
							return atRule.nodes.forEach((node) => root.append(node.clone()))

						default:
							return
					}
				})

				return root
			}),

			_mergeDecls: NGN.privateconst((rule, customDecls) => {
				rule.walkDecls((decl) => {
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

			_mergeRules: NGN.privateconst((rule, custom) => {
				let customRules = custom.nodes.filter((node) => node.type === 'rule')
				let customDecls = custom.nodes.filter((node) => node.type === 'decl')

				this._mergeDecls(rule, customDecls)
			}),

			_processAtRule: NGN.privateconst((atRule) => {
				let data = Object.assign({
					root: this.tree,
					atRule
				}, this.chassis.atRules.getProperties(atRule))

				this.chassis.atRules.process(data)
			}),

			_resolveVariables: NGN.privateconst((root, variables = this.variables) => {
				let { utils } = this.chassis

				root.walkRules((rule) => {
					rule.selector = this.variables.selectors.map((selector) => {
						return utils.string.resolveVariables(rule.selector, {selector})
					}).join(', ')

					rule.walkDecls((decl) => {
			      decl.prop = utils.string.resolveVariables(decl.prop, this.variables)
			      decl.value = utils.string.resolveVariables(decl.value, this.variables)
			    })
				})

				return root
			})
		})
	}

	get css () {
		let template = this._generateTemplate()

		return this._resolveVariables(template)
	}

	getCustomizedCss (customSpec) {
		let template = this._generateCustomTemplate(customSpec)

		let customVariables = Object.assign(this.variables, {
			selectors: customSpec.nodes[0].selector.split(',')
		})

		let resolved = this._resolveVariables(template, customVariables)

		resolved.walkAtRules('chassis', (atRule) => this._processAtRule(atRule))

		return resolved
	}

	getUnthemedCss (customSpec) {
		let template = this._generateTemplate(customSpec)

		let customVariables = Object.assign(this.variables, {
			selectors: customSpec.nodes[0].selector.split(',')
		})

		let resolved = this._resolveVariables(template, customVariables)

		resolved.walkAtRules('chassis', (atRule) => this._processAtRule(atRule))

		return resolved
	}

	getThemedCss (theme) {
		let template = this._generateTemplate(theme)
		let resolved = this._resolveVariables(template)

		resolved.walkAtRules('chassis', (atRule) => this._processAtRule(atRule))

		return resolved
	}
}

module.exports = ChassisSpecSheet
