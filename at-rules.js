module.exports = (function () {
	let _ = new WeakMap()

	return class {
		constructor (chassis) {
			_.set(this, {
				chassis,

				mixins: {
					browser: new (require('./mixins/browser.js'))(chassis),
					component: new (require('./mixins/component.js'))(chassis),
					layout: new (require('./mixins/layout.js'))(chassis),
					styleSheet: new (require('./mixins/style-sheet.js'))(chassis),
					typography: new (require('./mixins/typography.js'))(chassis),
					viewport: new (require('./mixins/viewport.js'))(chassis)
				}
			})
		}

		get 'apply' () {
			return data => _.get(this).mixins.typography.applyProps(data)
		}

		get 'constrain-width' () {
			return data => _.get(this).mixins.layout.constrainWidth(data)
		}

		get 'constrain' () {
			return data => _.get(this).mixins.layout.constrain(data)
		}

		get 'ellipsis' () {
			return data => _.get(this).mixins.typography.ellipsis(data)
		}

		get 'extend' () {
			return data => _.get(this).mixins.component.extend(data)
		}

		get 'ie-only' () {
			return data => _.get(this).mixins.browser.ieOnly(data)
		}

		get 'import' () {
			return data => _.get(this).mixins.styleSheet.import(data)
		}

		get 'include' () {
			return data => _.get(this).mixins.component.include(data)
		}

		get 'init' () {
			return data => data.atRule.remove()
		}

		get 'font-size' () {
			return data => _.get(this).mixins.typography.fontSize(data)
		}

		get 'new' () {
			return data => _.get(this).mixins.component.new(data)
		}

		get 'viewport-height' () {
			return data => _.get(this).mixins.viewport.height(data)
		}

		get 'vp-height' () {
			return data => _.get(this).mixins.viewport.height(data)
		}

		get 'viewport-width' () {
			return data => _.get(this).mixins.viewport.width(data)
		}

		get 'vp-width' () {
			return data => _.get(this).mixins.viewport.width(data)
		}

		get 'z-index' () {
			return data => _.get(this).mixins.layout.zIndex(data)
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
				this[data.mixin](data)
				return
			}

			console.error(`[ERROR] Line ${data.source.line}: Mixin "${data.mixin}" not found.`)
		}
	}
})()
