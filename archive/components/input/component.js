module.exports = class {
	constructor (chassis) {
		Object.defineProperties(this, {
			chassis: NGN.privateconst(chassis)
		})

		this.resetType = 'inline-block'
	}

	get variables () {
		return {}
	}
}
