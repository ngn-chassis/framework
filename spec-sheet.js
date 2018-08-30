module.exports = (function () {
	let _private = new WeakMap()

	return class {
		constructor (chassis, type, spec, instance) {
			this.type = type
			this.states = []

			_private.set(this, {
				chassis,

				overrides: NGN.coalesce(instance.overrides),
				spec,

				applyCustomizedState: (state, customState) => {
					let { utils } = _private.get(this).chassis

					if (!this.states.includes(customState.params)) {
						console.warn(`[WARNING] Chassis "${this.type}" component does not support "${customState.params}" state. Discarding...`)
						return
					}

					let customRules = customState.nodes.filter(node => node.type === 'rule')
					let customDecls = customState.nodes.filter(node => node.type === 'decl')
					let overrides = null

					if (_private.get(this).overrides) {
						overrides = _private.get(this).generateOverrides(_private.get(this).overrides, state)
					}

					state.walkRules((rule, index) => {
						// Initial state is always first
						if (index === 0) {
							_private.get(this).mergeDecls(rule, customDecls)

							if (overrides) {
								_private.get(this).mergeDecls(rule, overrides)
							}
						}

						let customRuleIndex

						let match = customRules.find((customRule, i) => {
							customRuleIndex = i
							return customRule.selector.replace('&', '').trim() === rule.selector.replace('$(selector)', '').trim()
						})

						if (match) {
							customRules.splice(customRuleIndex, 1)
							_private.get(this).mergeRules(rule, match)
						}
					})

					customRules.forEach(customRule => {
						customRule.selector = `${state.nodes[0].selector} ${customRule.selector.replace('&', '').trim()}`
					})

					state.nodes.push(...customRules)
				},

				findMatchingState: (state, customSpec) => {
					let customState = null

					customSpec.walkAtRules('state', atRule => {
						if (atRule.params === state.params) {
							customState = atRule
						}
					})

					return customState
				},

				generateCustomizedState: (state, customState, cb) => {
					let { utils } = _private.get(this).chassis

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
				},

				generateCustomTemplate: customSpec => {
					let { utils } = _private.get(this).chassis
					let root = utils.css.newRoot([])

					_private.get(this).spec.walkAtRules(state => {
						switch (state.name) {
							case 'state':
								let customState = _private.get(this).findMatchingState(state, customSpec)

								if (!customState) {
									return
								}

								_private.get(this).generateCustomizedState(state, customState, result => {
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
				},

				generateOverrides: (type, state) => {
					let { componentOverrides, theme, utils } = _private.get(this).chassis

					if (!componentOverrides.hasOwnProperty(type)) {
						return
					}

					let stateOverrides = componentOverrides[type][state.params]

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
						return uniqueOverridableDecls.map(prop => utils.css.newDecl(prop, 'initial'))
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
								return utils.css.newDecl(prop, 'initial')
							}))
						}
					}

					return overrides.length > 0 ? overrides : null
				},

				generateTemplate: (customSpec = null) => {
					let { utils } = _private.get(this).chassis
					let root = utils.css.newRoot([])

					_private.get(this).spec.walkAtRules(atRule => {
						switch (atRule.name) {
							case 'state':
								if (customSpec) {
									let customState = _private.get(this).findMatchingState(atRule, customSpec)

									if (!customState) {
										return
									}

									_private.get(this).applyCustomizedState(atRule, customState)
								}

								return atRule.nodes.forEach(node => root.append(node.clone()))

							case 'legacy':
								return atRule.nodes.forEach(node => root.append(node.clone()))

							default:
								return
						}
					})

					return root
				},

				mergeDecls: (rule, customDecls) => {
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
				},

				mergeRules: (rule, custom) => {
					let customRules = custom.nodes.filter(node => node.type === 'rule')
					let customDecls = custom.nodes.filter(node => node.type === 'decl')

					_private.get(this).mergeDecls(rule, customDecls)
				},

				processAtRule: atRule => {
					let data = Object.assign({
						root: this.tree,
						atRule
					}, _private.get(this).chassis.atRules.getProperties(atRule))

					_private.get(this).chassis.atRules.process(data)
				},

				resolveVariables: (root, variables = this.variables) => {
					let { utils } = _private.get(this).chassis

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
				}
			})

			// Strip comments from spec sheet
			chassis.utils.css.stripComments(_private.get(this).spec)

			// Get selector list from first line of spec sheet
			this.selectors = _private.get(this).spec.nodes[0].selector.split(',')

			if (chassis.componentExtensions.hasOwnProperty(type)) {
	      this.selectors.push(...chassis.componentExtensions[type]);
			}

			this.variables = Object.assign(NGN.coalesce(instance.variables, {}), {
				selectors: this.selectors
			})

			// Store states
			_private.get(this).spec.walkAtRules('state', atRule => this.states.push(atRule.params))
		}

		get css () {
			let template = _private.get(this).generateTemplate()

			return _private.get(this).resolveVariables(template)
		}

		getCustomizedCss (customSpec) {
			let template = _private.get(this).generateCustomTemplate(customSpec)

			let customVariables = Object.assign(this.variables, {
				selectors: customSpec.nodes[0].selector.split(',')
			})

			let resolved = _private.get(this).resolveVariables(template, customVariables)

			resolved.walkAtRules('chassis', atRule => _private.get(this).processAtRule(atRule))

			return resolved
		}

		getUnthemedCss (customSpec) {
			let template = _private.get(this).generateTemplate(customSpec)

			let customVariables = Object.assign(this.variables, {
				selectors: customSpec.nodes[0].selector.split(',')
			})

			let resolved = _private.get(this).resolveVariables(template, customVariables)

			resolved.walkAtRules('chassis', atRule => _private.get(this).processAtRule(atRule))

			return resolved
		}

		getThemedCss (theme) {
			let template = _private.get(this).generateTemplate(theme)
			let resolved = _private.get(this).resolveVariables(template)

			resolved.walkAtRules('chassis', atRule => _private.get(this).processAtRule(atRule))

			return resolved
		}
	}
})()
