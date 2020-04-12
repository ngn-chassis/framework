module.exports = class {
	constructor (chassis) {
		Object.defineProperties(this, {
			chassis: NGN.privateconst(chassis),

			browser: NGN.privateconst(new (require('./mixins/browser.js'))(chassis)),
			component: NGN.privateconst(new (require('./mixins/component.js'))(chassis)),
			layout: NGN.privateconst(new (require('./mixins/layout.js'))(chassis)),
			stylesheet: NGN.privateconst(new (require('./mixins/style-sheet.js'))(chassis)),
			typography: NGN.privateconst(new (require('./mixins/typography.js'))(chassis)),
			viewport: NGN.privateconst(new (require('./mixins/viewport.js'))(chassis)),

			apply: NGN.privateconst(function () {
				return this.typography.applyProps(...arguments)
			}),

			'constrain-width': NGN.privateconst(function () {
				return this.layout.constrainWidth(...arguments)
			}),

			constrain: NGN.privateconst(function () {
				return this.layout.constrain(...arguments)
			}),

			ellipsis: NGN.privateconst(function () {
				return this.typography.ellipsis(...arguments)
			}),

			extend: NGN.privateconst(function () {
				return this.component.extend(...arguments)
			}),

			'ie-only': NGN.privateconst(function () {
				return this.browser.ieOnly(...arguments)
			}),

			import: NGN.privateconst(function () {
				return this.stylesheet.import(...arguments)
			}),

			include: NGN.privateconst(function () {
				return this.component.include(...arguments)
			}),

			init: NGN.privateconst(function () {
				return arguments[0].atRule.remove()
			}),

			'font-size': NGN.privateconst(function () {
				return this.typography.fontSize(...arguments)
			}),

			new: NGN.privateconst(function () {
				return this.component.new(...arguments)
			}),

			'viewport-height': NGN.privateconst(function () {
				return this.viewport.height(...arguments)
			}),

			'vp-height': NGN.privateconst(function () {
				return this.viewport.height(...arguments)
			}),

			'viewport-width': NGN.privateconst(function () {
				return this.viewport.width(...arguments)
			}),

			'vp-width': NGN.privateconst(function () {
				return this.viewport.width(...arguments)
			}),

			'z-index': NGN.privateconst(function () {
				return this.layout.zIndex(...arguments)
			})
		})
	}

	getProperties (atRule) {
		let params = atRule.params.split(' ')

		let data = {
			mixin: params[0],
			args: params.length > 1 ? params.slice(1) : [],
			nodes: atRule.nodes || []
		}

		if (atRule.hasOwnProperty('source') && atRule.source.hasOwnProperty('start')) {
			data.source = atRule.source.start
		}

		return data
	}

	process (data) {
		if (data.mixin in this) {
			return this[data.mixin](data)
		}

		throw this.chassis.utils.error.create({
			line: data.source.line,
			message: `Mixin "${data.mixin}" not found.`
		})
	}
}
