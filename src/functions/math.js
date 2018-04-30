const valueParser = require('postcss-value-parser')

class ChassisMathFunctions {
  constructor (chassis) {
    this.chassis = chassis
  }

  /**
   * @function absolute
   */
  absolute () {
    let node = arguments[0]

    if (!node.nodes.length) {
			// TODO: throw error
			return
		}

		return Math.abs(node.nodes[0].value)
  }

  cbrt () {
    let node = arguments[0]
    return Math.cbrt(node.nodes[0].value)
  }

  ceiling () {
    let node = arguments[0]

    if (!node.nodes.length) {
			// TODO: throw error
			return
		}

		return Math.ceil(node.nodes[0].value)
  }

  evaluate () {
    let node = arguments[0]
		let string = valueParser.stringify(node)
		let expression = string.replace(node.value, '').replace(/\(|\)/g, '')

		if (node.nodes[0].type === 'string') {
			expression = eval(expression)
		}

		return eval(expression)
	}

  floor () {
    let node = arguments[0]

    if (!node.nodes.length) {
			// TODO: throw error
			return
		}

		return Math.floor(node.nodes[0].value)
  }

  pow () {
    let node = arguments[0]

    let base = node.nodes[0].value
    let exponent = node.nodes.length === 3 ? node.nodes[2].value : 1

    return Math.pow(base, exponent)
  }

  max () {
    let node = arguments[0]

    let args = node.nodes.filter(innerNode => {
      return innerNode.type === 'word'
    }).map(innerNode => parseInt(innerNode.value))

		return Math.max(...args)
	}

  min () {
    let node = arguments[0]

    let args = node.nodes.filter(innerNode => {
      return innerNode.type === 'word'
    }).map(innerNode => parseInt(innerNode.value))

		return Math.min(...args)
	}

  random () {
    let node = arguments[0]
		return Math.random() * (node.nodes.length ? node.nodes[0].value : 1)
	}

  round () {
    let node = arguments[0]
    let { utils } = this.chassis

    let number = node.nodes[0].value
    let decimalPlaces = node.nodes.length === 3 ? node.nodes[2].value : 0

    return utils.math.precisionRound(number, decimalPlaces)
  }

  sqrt () {
    let node = arguments[0]
    return Math.sqrt(node.nodes[0].value)
  }

  trunc () {
    let node = arguments[0]
    return Math.trunc(node.nodes[0].value)
  }
}

module.exports = ChassisMathFunctions
