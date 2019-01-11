module.exports = class {
	constructor (chassis) {
		Object.defineProperties(this, {
			chassis: NGN.privateconst(chassis),

			functions: NGN.privateconst({
				math: new (require('./functions/math.js'))(chassis)
			})
		})
	}

	get 'absolute' () {
		return node => this.functions.math.absolute(node)
	}

	get 'cbrt' () {
		return node => this.functions.math.cbrt(node)
	}

	get 'ceiling' () {
		return node => this.functions.math.ceiling(node)
	}

	get 'eval' () {
		return node => this.functions.math.evaluate(node)
	}

	get 'floor' () {
		return node => this.functions.math.floor(node)
	}

	get 'max' () {
		return node => this.functions.math.max(node)
	}

	get 'min' () {
		return node => this.functions.math.min(node)
	}

	get 'pow' () {
		return node => this.functions.math.pow(node)
	}

	get 'random' () {
		return node => this.functions.math.random(node)
	}

	get 'round' () {
		return node => this.functions.math.round(node)
	}

	get 'sqrt' () {
		return node => this.functions.math.sqrt(node)
	}

	get 'trunc' () {
		return node => this.functions.math.trunc(node)
	}

	process (data) {
		data.parsed.walk((outerNode, outerIndex) => {
			if (outerNode.type !== 'function' || !(outerNode.value in this)) {
				return
			}

			outerNode.value = this[outerNode.value](outerNode)
			outerNode.type = 'word'
		})

		return data.parsed.toString()
	}
}
