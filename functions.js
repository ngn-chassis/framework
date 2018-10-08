module.exports = (function () {
	let _ = new WeakMap()

	return class {
		constructor (chassis) {
			_.set(this, {
				chassis,

				functions: {
					math: new (require('./functions/math.js'))(chassis)
				}
			})
		}

		get 'absolute' () {
			return node => _.get(this).functions.math.absolute(node)
		}

		get 'cbrt' () {
			return node => _.get(this).functions.math.cbrt(node)
		}

		get 'ceiling' () {
			return node => _.get(this).functions.math.ceiling(node)
		}

		get 'eval' () {
			return node => _.get(this).functions.math.evaluate(node)
		}

		get 'floor' () {
			return node => _.get(this).functions.math.floor(node)
		}

		get 'max' () {
			return node => _.get(this).functions.math.max(node)
		}

		get 'min' () {
			return node => _.get(this).functions.math.min(node)
		}

		get 'pow' () {
			return node => _.get(this).functions.math.pow(node)
		}

		get 'random' () {
			return node => _.get(this).functions.math.random(node)
		}

		get 'round' () {
			return node => _.get(this).functions.math.round(node)
		}

		get 'sqrt' () {
			return node => _.get(this).functions.math.sqrt(node)
		}

		get 'trunc' () {
			return node => _.get(this).functions.math.trunc(node)
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
})()
