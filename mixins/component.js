const ChassisComponent = require('../component')

module.exports = class {
	constructor (chassis) {
		Object.defineProperties(this, {
			chassis: NGN.privateconst(chassis),
			components: NGN.privateconst(chassis.constants.components)
		})
	}

	extend () {
		let { chassis, components } = this
		let { componentExtensions, settings, utils } = chassis
		let { args, atRule, source } = arguments[0]
		let type = args[0]

		if (!components.has(type)) {
			console.warn(`[WARNING] Line ${source.line}: Extensible component "${type}" not found. Discarding...`)
			atRule.remove()
			return
		}

		let selectors = utils.css.getSelectorListAsArray(atRule.parent.selector)
		componentExtensions.contains(type) ? componentExtensions.extend(type, selectors) : componentExtensions.add(type, selectors)

		let spec = utils.css.createRule(atRule.parent.selector)
		spec.nodes = atRule.nodes

		let component = new ChassisComponent(chassis, type, utils.css.createRoot([spec]), true)
		atRule.parent.replaceWith(component.customCss)
	}

	include () {
		let { settings, utils } = this.chassis
		let { args, atRule, root, source } = arguments[0]

		let requestedComponents = []

		if (args.includes('all')) {
			for (let [key, value] of this.components) {
				if (!Array.isArray(value)) {
					requestedComponents.push(key)
				}
			}
		} else {
			for (let component of args) {
				if (!this.components.has(component)) {
					console.warn(`[WARNING] Line ${source.line}: Component "${type}" not found. Discarding...`)
					continue
				}

				let data = this.components.get(component)

				if (Array.isArray(data)) {
					requestedComponents.push(...data)
				} else {
					requestedComponents.push(component, ...data.dependencies)
				}
			}
		}

		// Order component includes for correct cascade behavior
		let sorted = []

		for (let [key, value] of this.components) {
			if (requestedComponents.includes(key)) {
				if (Array.isArray(value)) {
					sorted.push(...value)
					continue
				}

				sorted.push(key)

				if (value.dependencies.length > 0) {
					sorted.push(...value.dependencies)
				}
			}
		}

		let css = NGN.dedupe(sorted).map(type => {
			let component = new ChassisComponent(this.chassis, type)
			let { themedCss } = component

			// Prepend :root with custom properties for each of the component's variables
			if (component.variables) {
				let rootRule = utils.css.createRule(':root', [])

				for (let variable in component.variables) {
					rootRule.nodes.push(utils.css.createDecl(`--${variable}`, component.variables[variable]))
				}

				themedCss.prepend(rootRule)
			}

			if (component.instance.resetType !== 'none') {
				settings.componentResetSelectors[component.instance.resetType].push(...component.defaultSpec.selectors)
			}

			return themedCss
		})

		atRule.replaceWith(css)
	}

	new () {
		let { settings, theme, utils } = this.chassis
		let { args, atRule, source } = arguments[0]
		let type = args[0]

		if (!this.components.has(type)) {
			console.warn(`[WARNING] Line ${source.line}: Chassis Component "${type}" not found. Discarding...`)
			atRule.remove()
			return
		}

		let spec = utils.css.createRule(atRule.parent.selector)
		spec.nodes = atRule.nodes

		let component = new ChassisComponent(this.chassis, type, utils.css.createRoot([spec]))

		if (component.instance.resetType !== 'none') {
			settings.componentResetSelectors[component.instance.resetType].push(...atRule.parent.selector.split(','))
		}

		atRule.parent.replaceWith(component.unthemedCss)
	}
}
