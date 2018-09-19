const ChassisComponent = require('../component')

module.exports = (function () {
	let _private = new WeakMap()

	return class {
		constructor (chassis) {
			_private.set(this, {
				chassis,

				components: chassis.constants.components
			})
	  }

		extend () {
			let { componentExtensions, settings, utils } = _private.get(this).chassis
			let { args, atRule, source } = arguments[0]
			let type = args[0]

			if (!_private.get(this).components.has(type)) {
				console.warn(`[WARNING] Line ${source.line}: Extensible component "${type}" not found. Discarding...`)
				atRule.remove()
				return
			}

			let selectors = atRule.parent.selector.split(',').map(selector => selector.trim())

			if (componentExtensions.hasOwnProperty(type)) {
				componentExtensions[type].push(...selectors)
			} else {
				componentExtensions[type] = selectors
			}

			let spec = utils.css.newRule(atRule.parent.selector)
			spec.nodes = atRule.nodes

			let component = new ChassisComponent(_private.get(this).chassis, type, utils.css.newRoot([spec]), true)

			atRule.parent.replaceWith(component.customRules)
		}

		include () {
			let { settings, utils } = _private.get(this).chassis
			let { args, atRule, root, source } = arguments[0]

			let requestedComponents = []

			if (args.includes('all')) {
				for (let [key, value] of _private.get(this).components) {
					if (!Array.isArray(value)) {
						requestedComponents.push(key)
					}
				}
			} else {
				for (let component of args) {
					if (!_private.get(this).components.has(component)) {
						console.warn(`[WARNING] Line ${source.line}: Component "${type}" not found. Discarding...`)
						continue
					}

					let data = _private.get(this).components.get(component)

					if (Array.isArray(data)) {
						requestedComponents.push(...data)
					} else {
						requestedComponents.push(component, ...data.dependencies)
					}
				}
			}

			// Order component includes for correct cascade behavior
			let sorted = []

			for (let [key, value] of _private.get(this).components) {
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
				let component = new ChassisComponent(_private.get(this).chassis, type)
				let { themedCss } = component

				// console.log(type);
				// console.log(component.themedCss.toString());
				// console.log('============================');
				// console.log(component.unthemedCss.toString());

				if (component.variables) {
					let rootRule = utils.css.newRule(':root', [])

					for (let variable in component.variables) {
						rootRule.nodes.push(utils.css.newDecl(`--${variable}`, component.variables[variable]))
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
			let { settings, theme, utils } = _private.get(this).chassis
			let { args, atRule, source } = arguments[0]
			let type = args[0]

			if (!_private.get(this).components.has(type)) {
				console.warn(`[WARNING] Line ${source.line}: Chassis Component "${type}" not found. Discarding...`)
				atRule.remove()
				return
			}

			let spec = utils.css.newRule(atRule.parent.selector)
			spec.nodes = atRule.nodes

			let component = new ChassisComponent(_private.get(this).chassis, type, utils.css.newRoot([spec]))

			if (component.instance.resetType !== 'none') {
				settings.componentResetSelectors[component.instance.resetType].push(...atRule.parent.selector.split(','))
			}

			atRule.parent.replaceWith(component.unthemedCss)
		}
	}
})()
