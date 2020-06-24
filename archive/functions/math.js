let valueParser = require('postcss-value-parser')

module.exports = class {
  constructor (chassis) {
    Object.defineProperties(this, {
      chassis: NGN.privateconst(chassis),

      generateArgsArray: NGN.privateconst(nodes => {
        return nodes
          .filter(innerNode => innerNode.type === 'word')
          .map(innerNode => parseInt(innerNode.value))
      })
    })
  }

  /**
   * @function absolute
   */
  absoluteValue () {
    return Math.abs(arguments[0].nodes[0].value)
  }

  cubeRoot () {
    return Math.cbrt(arguments[0].nodes[0].value)
  }

  ceiling () {
    return Math.ceil(arguments[0].nodes[0].value)
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
    return Math.floor(arguments[0].nodes[0].value)
  }

  exponentPower () {
    let node = arguments[0]
    let base = node.nodes[0].value
    let exponent = node.nodes.length === 3 ? node.nodes[2].value : 1

    return Math.pow(base, exponent)
  }

  max () {
    return Math.max(...this.generateArgsArray(arguments[0].nodes))
  }

  min () {
    return Math.min(...this.generateArgsArray(arguments[0].nodes))
  }

  random () {
    return Math.random() * (arguments[0].nodes.length ? arguments[0].nodes[0].value : 1)
  }

  round () {
    let node = arguments[0]
    let { utils } = this.chassis
    let number = node.nodes[0].value
    let decimalPlaces = node.nodes.length === 3 ? node.nodes[2].value : 0

    return utils.math.precisionRound(number, decimalPlaces)
  }

  squareRoot () {
    return Math.sqrt(arguments[0].nodes[0].value)
  }

  truncate () {
    return Math.trunc(arguments[0].nodes[0].value)
  }
}
