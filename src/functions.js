const valueParser = require('postcss-value-parser')

class ChassisFunctions {
	constructor (chassis) {
		this.chassis = chassis
	}

	evaluate (node) {
		let string = valueParser.stringify(node)
		let expression = string.replace(node.value, '').replace(/\(|\)/g, '')

		return eval(expression)
	}

	process (data) {
		data.parsed.walk((outerNode, outerIndex) => {
			if (outerNode.type !== 'function') {
				return
			}

			switch (outerNode.value) {
				case 'eval':
					outerNode.value = this.evaluate(outerNode)
					outerNode.type = 'word'
					break

				default: return
			}
		})

    return data.parsed.toString()
	}
}

module.exports = ChassisFunctions
