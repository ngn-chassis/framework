module.exports = (function () {
  let _private = new WeakMap()

  return class {
    constructor (chassis) {
      _private.set(this, {chassis})
    }

    height () {
  		let { settings, utils, viewport } = _private.get(this).chassis
      let { atRule, args, nodes, source } = arguments[0]

  		let operator = args[0]
  		let height = parseInt(args[1])

  		if (isNaN(height)) {
  			console.error(`[ERROR] Line ${source.line}: Invalid viewport height value "${args[1]}".`)
  			atRule.remove()
  			return
  		}

  		let mediaQuery = utils.css.newMediaQuery(
  			viewport.getMediaQueryParams('height', operator, height),
  			nodes
  		)

  		atRule.replaceWith(mediaQuery)
  	}

    width () {
      let { settings, utils, viewport } = _private.get(this).chassis
      let { atRule, args, nodes, source } = arguments[0]

  		let operator = args[0]

  		if (!viewport.operatorIsValid(operator)) {
  			console.error(`[ERROR] Line ${source.line}: Invalid media query operator "${operator}".`)
  			atRule.remove()
  			return
  		}

      let isEnv = args[1].startsWith('env(')
  		let width = isEnv ? args[1] : parseInt(args[1])
  		let isRange = false
      let buffer = 0

  		if (!isEnv && isNaN(width)) {
  			let name = args[1]

        if (name.includes('(')) {
          let params = name.split('(')

          if (params[1].endsWith(')')) {
            params[1] = params[1].slice(0,-1)
          }

          name = params[0]

          if (params[1].includes(',')) {
            buffer = params[1].split(',').map(value => parseInt(utils.string.stripUnits(value)))

          } else {
            buffer = utils.string.getUnits(params[1]) ? utils.string.stripUnits(params[1]) : params[1]
          }
        }

  			width = settings.viewportWidthRanges.find({name})[0]

  			if (!width) {
  				console.error(`[ERROR] Line ${source.line}: Viewport Width Range "${args[1]}" not found.`)
  				atRule.remove()
  				return
  			}

  			isRange = true
  		}

  		if (operator === 'from') {
  			let secondOperator = args[2]

  			if (secondOperator !== undefined) {
  				if (secondOperator !== 'to') {
  					console.error(`[ERROR] Line ${source.line}: Invalid second media query operator "${secondOperator}". Please use "to" instead.`)
  					atRule.remove()
  					return
  				}

  				operator = '='

  				let secondWidthValue = args[3]
  				let secondWidthValueIsRange = false

  				if (isNaN(secondWidthValue)) {
  					secondWidthValue = settings.viewportWidthRanges.find({
  						name: secondWidthValue
  					})[0]

  					if (!secondWidthValue) {
  						console.error(`[ERROR] Line ${source.line}: Viewport Width Range "${args[3]}" not found.`)
  						atRule.remove()
  						return
  					}

  					secondWidthValueIsRange = true
  				}

  				if (secondWidthValue) {
  					width = {
  						name: 'custom',
  						lowerBound: isRange ? width.lowerBound : width,
  						upperBound: secondWidthValueIsRange ? secondWidthValue.upperBound : secondWidthValue
  					}
  				}
  			}
  		}

      if (typeof buffer === 'string') {
        if (buffer.startsWith('+-') || buffer.startsWith('-+')) {
          buffer = [parseInt(buffer.substring(2)), parseInt(buffer.substring(2))]
        } else if (buffer.startsWith('+')) {
  				buffer = buffer.substring(1)
  			}
      }

      if (!Array.isArray(buffer)) {
        buffer = parseInt(buffer)
      }

  		let mediaQuery = utils.css.newMediaQuery(
  			viewport.getMediaQueryParams('width', operator, width, buffer),
  			nodes
  		)

  		atRule.replaceWith(mediaQuery)
    }
  }
})()
