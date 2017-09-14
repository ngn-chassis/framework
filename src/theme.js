const postcss = require('postcss')
const customProperties = require('postcss-custom-properties')

class ChassisTheme {
	constructor (chassis) {
		this.chassis = chassis
		this.rules = []
		this.components = []
		this.componentSpecs = []

		this.filename = chassis.utils.files.getFileName(chassis.settings.theme)

		let pathIsAbsolute = chassis.utils.files.pathIsAbsolute(chassis.settings.theme)

		this.tree = chassis.utils.files.parseStyleSheet(chassis.settings.theme, !pathIsAbsolute)

		this.hasCustomProperties = this.tree.some((rule) => rule.selector === 'custom-properties')
		this.hasRootBlock = this.tree.some((rule) => rule.selector === ':root')
		
		this._initialize()
	}
	
	get customProperties () {
		return this.json['custom-properties']
	}
	
	get json () {
		return this.chassis.utils.theme.generateJson(this.tree)
	}
	
	getElement (element) {
		if (!this.json.elements.hasOwnProperty(element)) {
			// TODO: Add Warning/Error message
			return null
		}
	
		return this.json.elements[element]
	}
	
	getComponent (component) {
		if (!this.json.components.hasOwnProperty(component)) {
			// TODO: Add Warning/Error message
			return null
		}
	
		return this.json.components[component]
	}
	
	getComponentSpec (component) {
		return this.componentSpecs.find((componentSpec) => {
			return componentSpec.selector === component
		})
	}
	
	_initialize () {
		let { constants } = this.chassis
		
		this.tree.walkRules((rule) => {
			if (rule.selector === 'custom-properties' && !this.hasRootBlock) {
				rule.cloneBefore(rule.clone({selector: ':root'}))
			}

			if (rule.selector === ':root' && !this.hasCustomProperties) {
				rule.cloneAfter(rule.clone({selector: 'custom-properties'}))
			}
			
			if (rule.selector === 'components') {
				rule.nodes.forEach((node) => {
					if (node.type === 'rule' && constants.components.has(node.selector)) {
						this.componentSpecs.push(node)
					}
				})
			}

			if (rule.parent.type === 'root') {
				if (this.rules.includes(rule.selector)) {
					// TODO: Instead of discarding duplicates, attempt to merge properties
					console.warn(`[WARNING] ${this.filename} line ${rule.source.start.line}: Duplicate selector "${rule.selector}". Discarding...`)
					rule.remove()
					return
				}

				this.components.push(rule.selector)
			}

			this.rules.push(rule.selector)
		})
	}
}

module.exports = ChassisTheme
