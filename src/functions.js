const ChassisMathFunctions = require('./functions/math.js')

class ChassisFunctions {
	constructor (chassis) {
		this.chassis = chassis

		this.mathFunctions = new ChassisMathFunctions(chassis)
	}

	get 'absolute' () {
		return node => this.mathFunctions.absolute(node)
	}

	get 'cbrt' () {
		return node => this.mathFunctions.cbrt(node)
	}

	get 'ceiling' () {
		return node => this.mathFunctions.ceiling(node)
	}

	get 'eval' () {
		return node => this.mathFunctions.evaluate(node)
	}

	get 'floor' () {
		return node => this.mathFunctions.floor(node)
	}

	get 'max' () {
		return node => this.mathFunctions.max(node)
	}

	get 'min' () {
		return node => this.mathFunctions.min(node)
	}

	get 'pow' () {
		return node => this.mathFunctions.pow(node)
	}

	get 'random' () {
		return node => this.mathFunctions.random(node)
	}

	get 'round' () {
		return node => this.mathFunctions.round(node)
	}

	get 'sqrt' () {
		return node => this.mathFunctions.sqrt(node)
	}

	get 'trunc' () {
		return node => this.mathFunctions.trunc(node)
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

module.exports = ChassisFunctions
