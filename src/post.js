class ChassisPost {
	constructor (chassis) {
		this.chassis = chassis
	}
	
	'component-reset' () {
		let { settings, utils } = this.chassis
    let { atRule, args, nodes } = arguments[0]
		
		let type = args[0]
		let list = settings.componentResetSelectorLists[type]
		
		if (list.length > 0) {
			atRule.replaceWith(utils.css.newRule(list, nodes))
			return
		}
		
		atRule.remove()
	}
	
	process (data) {
		if (data.mixin in this) {
			this[data.mixin](data)
			return
		}

		console.error(`[ERROR] Chassis Post-Processing: Mixin "${data.mixin}" not found.`)
	}
}

module.exports = ChassisPost
