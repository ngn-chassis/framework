class ChassisThemeUtils {
	static componentSelectorIsValid (component) {
		let hasCommas = component.selector.includes(',')
		let numIssues = 0

		if (hasCommas) {
			numIssues++
			console.warn(`[WARNING]: ${this.filename} line ${component.source.start.line}: Chassis Themes do not support comma-separated component selectors. Discarding...`)
		}

		return numIssues === 0
	}

	static generateJson (tree) {
		let json = {
			components: {},
			elements: {}
		}

		tree.nodes.forEach(node => {
			if (node.selector === 'components') {
				let components = node.nodes

				components.forEach(component => {
					if (component.type === 'comment') {
						return
					}

					if (!this.componentSelectorIsValid(component)) {
						return
					}

					json.components[component.selector] = this.generateComponentJson(component)
				})

				return
			}

			if (node.selector === ':root' || node.selector === 'custom-properties') {
				json[node.selector] = this.generateCustomProperties(node)
				return
			}

			json.elements[node.selector] = this.generateRulesetJson(node)
		})

		return json
	}

	static generateComponentJson (component) {
		let json = {
			default: {}
		}

		component.nodes.forEach(node => {
			switch (node.type) {
				case 'comment':
					return

				case 'decl':
					return console.warn(`[WARNING]: ${this.filename} line ${node.source.start.line}: "${component.selector}" component: Theme properties must be assigned to a component state or an element selector. Discarding unassigned "${node.prop}" property...`)

				case 'atrule':
					return node.params === 'variants'
						? json.variants = this.generateComponentVariantJson(node)
						: json[node.params] = this.generateComponentStateJson(node)

				default:
					return console.warn(`[WARNING]: ${this.filename} line ${node.source.start.line}: Chassis Themes do not support nodes of type "${node.type}". Discarding...`)
			}
		})

		return json
	}

	static generateComponentStateJson (state) {
		let json = {
			properties: {},
			rules: {}
		}

		state.nodes.forEach(node => {
			switch (node.type) {
			  case 'comment':
			    return

			  case 'rule':
			    return json.rules[node.selector] = this.generateRulesetJson(node)

			  case 'decl':
			    return json.properties[node.prop] = node.value

			  default:
			    console.warn(`[WARNING]: ${this.filename} line ${node.source.start.line}: Chassis Themes: Component states do not support nodes of type "${node.type}". Discarding...`)
			    node.remove()
			    return
			}
		})

		return json
	}

	static generateComponentVariantJson (variant) {
		let json = {}

		variant.nodes.forEach(node => {
			switch (node.type) {
				case 'comment':
					return

				case 'rule':
					return json[node.selector] = this.generateComponentJson(node)

				default:
					console.warn(`[WARNING]: ${this.filename} line ${node.source.start.line}: Invalid Component Variant type "${node.type}". Component Variants must be declared as rulesets with CSS declarations inside. Discarding...`)
					node.remove()
					return
			}
		})

		return json
	}

	static generateCustomProperties (root) {
		let json = {}

		root.nodes.forEach(node => {
			json[node.prop] = node.value
		})

		return json
	}

	static generateRulesetJson (ruleset) {
		let json = {
			properties: {},
			rules: {}
		}

		ruleset.nodes.forEach(node => {
			switch (node.type) {
				case 'comment':
					return

				case 'rule':
					return json.rules[node.selector] = this.generateRulesetJson(node)

				case 'decl':
					return json.properties[node.prop] = node.value

				default:
					console.warn(`[WARNING]: ${this.filename} line ${node.source.start.line}: Chassis Themes: Rulesets nested within component states do not support nodes of type "${node.type}". Discarding...`)
					node.remove()
					return
			}
		})

		return json
	}
}

module.exports = ChassisThemeUtils
