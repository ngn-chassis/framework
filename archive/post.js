module.exports = class {
	constructor (chassis) {
		Object.defineProperties(this, {
			chassis: NGN.privateconst(chassis)
		})
	}

	'component-reset' () {
		let { settings, utils } = this.chassis
		let { atRule, args, nodes } = arguments[0]

		let type = args[0]
		let list = settings.componentResetSelectorLists[type]

		if (list.length > 0) {
			atRule.replaceWith(utils.css.createRule(list, nodes))
			return
		}

		atRule.remove()
	}

	process (data) {
		if (data.mixin in this) {
			this[data.mixin](data)
			return
		}

		throw this.chassis.utils.error.create({
			line: data.source.line,
			mixin: 'post',
			message: `Invalid mixin "${data.mixin}"`
		})
	}
}
