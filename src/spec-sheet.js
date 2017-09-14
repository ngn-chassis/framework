const nesting = require('postcss-nesting')

class ChassisSpecSheet {
	constructor (chassis, type, spec, instance) {
		this.chassis = chassis
		this.type = type
		this.spec = spec
		this.overridesLinks = instance.overridesLinks === true
		
		this.states = []
		
		this.spec.walkComments((comment) => comment.remove())
		
		this.selectors = this.spec.nodes[0].selector.split(',')
		
		if (chassis.componentExtensions.hasOwnProperty(type)) {
      this.selectors.push(...chassis.componentExtensions[type]);
		}
		
		this.variables = Object.assign(NGN.coalesce(instance.variables, {}), {
			selectors: this.selectors
		})
		
		this.spec.walkAtRules('state', (atRule) => this.states.push(atRule.params))
	}
	
	get css () {
		let template = this.generateTemplate()
		
		return this.resolveVariables(template)
	}
	
	getCustomizedCss (customSpec) {
		let template = this.generateCustomTemplate(customSpec)
		
		let customVariables = Object.assign(this.variables, {
			selectors: customSpec.nodes[0].selector.split(',')
		})
		
		return this.resolveVariables(template, customVariables)
	}
	
	getUnthemedCss (customSpec) {
		let template = this.generateTemplate(customSpec)
		
		let customVariables = Object.assign(this.variables, {
			selectors: customSpec.nodes[0].selector.split(',')
		})
		
		return this.resolveVariables(template, customVariables)
	}
	
	getThemedCss (theme) {
		let template = this.generateTemplate(theme)
		return this.resolveVariables(template)
	}
	
	generateCustomTemplate (customSpec) {
		let { utils } = this.chassis
		let root = utils.css.newRoot([])
		
		this.spec.walkAtRules((state) => {
			switch (state.name) {
				case 'state':
					let customState = this._findMatchingState(state, customSpec)
					
					if (!customState) {
						return
					}
					
					this._generateCustomizedState(state, customState)
					state.nodes.forEach((node) => root.append(node))
					break
					
				case 'legacy':
					
					break
					
				default:
					return
			}
		})
		
		return root
	}
	
	generateTemplate (customSpec = null) {
		let { utils } = this.chassis
		let root = utils.css.newRoot([])
		
		this.spec.walkAtRules((state) => {
			switch (state.name) {
				case 'state':
					if (customSpec) {
						let customState = this._findMatchingState(state, customSpec)
						
						if (!customState) {
							return
						}
						
						this._applyCustomizedState(state, customState)
					}
					
					state.nodes.forEach((node) => root.append(node))
					break
					
				case 'legacy':
					state.nodes.forEach((node) => root.append(node))
					break
					
				default:
					return
			}
		})
		
		return root
	}
	
	resolveVariables (root, variables = this.variables) {
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
	}
	
	_generateLinkOverrides (state) {
		let { linkOverrides, theme, utils } = this.chassis
		
		let linkStateOverrides = linkOverrides[state.params]
	
		if (!linkStateOverrides) {
			return
		}
		
		let defaultTheme = theme.getComponent(this.type)
		
		let defaultState = defaultTheme['default']
		let currentState = defaultTheme[state.params]
		
		let linkDecls = utils.css.generateDeclsFromTheme(linkStateOverrides)
		let defaultStateDecls = utils.css.generateDeclsFromTheme(defaultState)
		let currentStateDecls = utils.css.generateDeclsFromTheme(currentState)
		
		let linkUniqueDecls = utils.css.getUniqueProps(linkDecls, currentStateDecls)
		
		// TODO: Handle nested rulesets
    // let defaultRules = theme.getRules(defaultTheme)
    // let stateRules = theme.getRules(stateTheme)
    
		if (state.params === 'default') {
			return linkUniqueDecls.map((prop) => utils.css.newDecl(prop, 'unset'))
		}
		
		let overrides = []
		
		// Props common between link.${state} and component.${state}
		let commonDecls = utils.css.getCommonProps(linkDecls, currentStateDecls)
		
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
		if (linkUniqueDecls.length > 0) {
			let unset = linkUniqueDecls.filter((prop) => {
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
					return utils.css.newDecl(prop, 'unset')
				}))
			}
		}
		
		return overrides.length > 0 ? overrides : null
	}
	
	_applyCustomizedState (state, customState) {
		let { utils } = this.chassis
		
		if (!this.states.includes(customState.params)) {
			console.warn(`[WARNING] Chassis "${this.type}" component does not support "${customState.params}" state. Discarding...`)
			return
		}
		
		let customRules = customState.nodes.filter((node) => node.type === 'rule')
		let customDecls = customState.nodes.filter((node) => node.type === 'decl')
		let overrides = null
		
		if (this.overridesLinks) {
			overrides = this._generateLinkOverrides(state)
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
	}
	
	_findMatchingState (state, customSpec) {
		let customState = null
		
		customSpec.walkAtRules('state', (atRule) => {
			if (atRule.params === state.params) {
				customState = atRule
			}
		})
		
		return customState
	}
	
	_generateCustomizedState (state, customState) {
		let { utils } = this.chassis
		
		if (!this.states.includes(customState.params)) {
			console.warn(`[WARNING] Chassis "${this.type}" component does not support "${customState.params}" state. Discarding...`)
			return
		}
		
		let customRules = customState.nodes.filter((node) => node.type === 'rule')
		let customDecls = customState.nodes.filter((node) => node.type === 'decl')
		
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
	}
	
	_mergeDecls (rule, customDecls) {
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
	}
	
	_mergeRules (rule, custom) {
		let customRules = custom.nodes.filter((node) => node.type === 'rule')
		let customDecls = custom.nodes.filter((node) => node.type === 'decl')
		
		this._mergeDecls(rule, customDecls)
	}
}

module.exports = ChassisSpecSheet
