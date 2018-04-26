class ChassisFunctions {
	constructor (chassis) {
		this.chassis = chassis
	}

	evaluate (expression) {
    return eval(expression)
	}

	process (data) {
    data.parsed.walk((node, index, nodes) => {
      if (node.type === 'function') {
        switch (node.value) {
          case 'eval':
            data.parsed.nodes = Object.assign([...nodes], {
              [index]: {
                type: 'word',
                sourceIndex: node.sourceIndex,
                value: this.evaluate(data.parsed.toString().replace(node.value, '').replace(/\(|\)/g,''))
              }
            })
            break

          default: return
        }
      }
    })

    return data.parsed.toString()
	}
}

module.exports = ChassisFunctions
