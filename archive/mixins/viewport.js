module.exports = class {
  constructor (chassis) {
    Object.defineProperties(this, {
      chassis: NGN.privateconst(chassis)
    })
  }

  height () {
    let { settings, utils, viewport } = this.chassis
    let { atRule, args, nodes, source } = arguments[0]

    let mixin = atRule.params.split(' ')[0]
    let operator = args[0]
    let height = parseInt(args[1])

    if (!viewport.operatorIsValid(operator)) {
      atRule.remove()

      throw this.chassis.utils.error.create({
  			line: source.line,
        mixin,
  			message: `Invalid media query operator "${operator}". Valid operators: ${viewport.validOperators.join(', ')}`
  		})
    }

    if (isNaN(height)) {
      atRule.remove()

      throw this.chassis.utils.error.create({
  			line: source.line,
        mixin,
  			message: `Invalid viewport height value "${args[1]}"`
  		})
    }

    let mediaQuery = utils.css.createMediaQuery(
      viewport.getMediaQueryParams('height', operator, height),
      nodes
    )

    atRule.replaceWith(mediaQuery)
  }

  width () {
    let { settings, utils, viewport } = this.chassis
    let { atRule, args, nodes, source } = arguments[0]

    let mixin = atRule.params.split(' ')[0]
    let operator = args[0]

    if (!viewport.operatorIsValid(operator)) {
      atRule.remove()

      throw this.chassis.utils.error.create({
  			line: source.line,
        mixin,
  			message: `Invalid media query operator "${operator}". Valid operators: ${utils.string.listValues(viewport.validOperators)}`
  		})
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
        throw this.chassis.utils.error.create({
    			line: source.line,
          mixin,
    			message: `Invalid Viewport Width Range "${args[1]}". Valid ranges: ${utils.string.listValues(settings.viewportWidthRanges.data.map(vwr => vwr.name))}`
    		})
      }

      isRange = true
    }

    if (operator === 'from') {
      let secondOperator = args[2]

      if (secondOperator !== undefined) {
        if (secondOperator !== 'to') {
          throw this.chassis.utils.error.create({
      			line: source.line,
            mixin,
      			message: `Invalid second media query operator "${secondOperator}". Please use "to" instead.`
      		})
        }

        operator = '='

        let secondWidthValue = args[3]
        let secondWidthValueIsRange = false

        if (isNaN(secondWidthValue)) {
          secondWidthValue = settings.viewportWidthRanges.find({
            name: secondWidthValue
          })[0]

          if (!secondWidthValue) {
            throw this.chassis.utils.error.create({
        			line: source.line,
              mixin,
        			message: `Invalid Viewport Width Range "${args[3]}". Valid ranges: ${utils.string.listValues(settings.viewportWidthRanges.data.map(vwr => vwr.name))}`
        		})
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

    let mediaQuery = utils.css.createMediaQuery(
      viewport.getMediaQueryParams('width', operator, width, buffer),
      nodes
    )

    atRule.replaceWith(mediaQuery)
  }
}
