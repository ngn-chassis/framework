let functions = {
	math: require('./functions/math.js')
}

module.exports = (function () {
	let _private = new WeakMap()

	return class {
		constructor (chassis) {
			_private.set(this, {
				chassis,

				functions: {
					math: new functions.math(chassis)
				}
			})
		}

		get 'absolute' () {
			return node => _private.get(this).functions.math.absolute(node)
		}

		get 'cbrt' () {
			return node => _private.get(this).functions.math.cbrt(node)
		}

		get 'ceiling' () {
			return node => _private.get(this).functions.math.ceiling(node)
		}

		get 'eval' () {
			return node => _private.get(this).functions.math.evaluate(node)
		}

		get 'floor' () {
			return node => _private.get(this).functions.math.floor(node)
		}

		get 'max' () {
			return node => _private.get(this).functions.math.max(node)
		}

		get 'min' () {
			return node => _private.get(this).functions.math.min(node)
		}

		get 'pow' () {
			return node => _private.get(this).functions.math.pow(node)
		}

		get 'random' () {
			return node => _private.get(this).functions.math.random(node)
		}

		get 'round' () {
			return node => _private.get(this).functions.math.round(node)
		}

		get 'sqrt' () {
			return node => _private.get(this).functions.math.sqrt(node)
		}

		get 'trunc' () {
			return node => _private.get(this).functions.math.trunc(node)
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
