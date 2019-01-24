let MathFunctions = require('./functions/math.js')

module.exports = class {
	constructor (chassis) {
		Object.defineProperties(this, {
			chassis: NGN.privateconst(chassis),
			math: NGN.privateconst(new MathFunctions(chassis)),

			abs: NGN.privateconst(function () {
				return this.math.absoluteValue(...arguments)
			}),

			cbrt: NGN.privateconst(function () {
				return this.math.cubeRoot(...arguments)
			}),

			ceil: NGN.privateconst(function () {
				return this.math.ceiling(...arguments)
			}),

			eval: NGN.privateconst(function () {
				return this.math.evaluate(...arguments)
			}),

			floor: NGN.privateconst(function () {
				return this.math.floor(...arguments)
			}),

			max: NGN.privateconst(function () {
				return this.math.max(...arguments)
			}),

			min: NGN.privateconst(function () {
				return this.math.min(...arguments)
			}),

			pow: NGN.privateconst(function () {
				return this.math.exponentPower(...arguments)
			}),

			random: NGN.privateconst(function () {
				return this.math.random(...arguments)
			}),

			round: NGN.privateconst(function () {
				return this.math.round(...arguments)
			}),

			sqrt: NGN.privateconst(function () {
				return this.math.squareRoot(...arguments)
			}),

			trunc: NGN.privateconst(function () {
				return this.math.truncate(...arguments)
			})
		})
	}

	process (data) {
		data.parsed.walk((outerNode, outerIndex) => {
			if (outerNode.type !== 'function' || !(outerNode.value in this)) {
				return
			}

			if (outerNode.nodes.length === 0) {
				throw this.chassis.utils.error.create({
	  			line: data.root.nodes[outerIndex].source.start.line,
	  			message: `Function received no argument.`
	  		})
			}

			outerNode.value = this[outerNode.value](outerNode)
			outerNode.type = 'word'
		})

		return data.parsed.toString()
	}
}
