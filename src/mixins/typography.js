class ChassisTypographyMixins {
  constructor (chassis) {
    this.chassis = chassis
    this.baseTypography = chassis.settings.typography.ranges.first.typography

    this.dimensions = [
      'top',
      'right',
      'bottom',
      'left'
    ]
  }

  _cleanseArgs (args, validArgs) {
    return args.map(arg => {
      if (!validArgs.includes(arg)) {
        console.error(`[ERROR] Chassis apply mixin: Invalid argument "${arg}". Discarding...`);
        return
      }

      return arg
    }).filter(entry => !!entry)
  }

  _getInlineBlockDecls (args, source) {
    let { settings, typography, utils } = this.chassis
    let { fontSize, lineHeight } = this.baseTypography.root

    args = this._cleanseArgs(args, [
      'inline-block',
      'rtl',
      'margin',
      'margin-x',
      'margin-y',
      'margin-top',
      'margin-right',
      'margin-bottom',
      'margin-left',
      'padding',
      'padding-x',
      'padding-y',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left'
    ])

    let lineHeightMult = utils.unit.pxToEm(lineHeight, fontSize)
    let calcLineHeight = typography.calculateInlineHeight(lineHeightMult)

    // 'rtl' argument is standalone since it only affects the value of properties,
    // not which properties are present. Therefore it will be ignored by hasArgs.
    let hasArgs = args.length > 1 && !(args.length === 2 && args[1] === 'rtl')
    let rtl = args.includes('rtl')

    let margin = {
      x: `${typography.calculateInlineMarginX(lineHeightMult)}em`,
      y: `${typography.calculateInlineMarginY(lineHeightMult)}em`
    }

    let padding = {
      x: `${typography.calculateInlinePaddingX(lineHeightMult)}em`,
      y: `${(calcLineHeight - lineHeightMult) / 2}em`
    }

    let props = {
      margin: {
        bottom: margin.y
      },
      padding: {
        top: padding.y,
        right: padding.x,
        bottom: padding.y,
        left: padding.x
      }
    }

    props.margin[rtl ? 'left' : 'right'] = margin.x

    if (!hasArgs) {
      return this._getApplyDecls(props)
    }

    let alteredProps = {}

    args.forEach(arg => {
      switch (arg) {
        case 'rtl':
          if (!alteredProps.hasOwnProperty('margin')) {
            alteredProps.margin = {}
          }

          alteredProps.margin.left = margin.x

          if (alteredProps.margin.hasOwnProperty('right')) {
            delete alteredProps.margin.right
          }
          break

        case 'margin':
          alteredProps.margin = props.margin
          break

        case 'margin-x':
          if (!alteredProps.hasOwnProperty('margin')) {
            alteredProps.margin = {}
          }

          alteredProps.margin.right = margin.x
          alteredProps.margin.left = margin.x
          break

        case 'margin-y':
          if (!alteredProps.hasOwnProperty('margin')) {
            alteredProps.margin = {}
          }

          alteredProps.margin.top = margin.y
          alteredProps.margin.bottom = margin.y
          break

        case 'margin-top':
          if (!alteredProps.hasOwnProperty('margin')) {
            alteredProps.margin = {}
          }

          alteredProps.margin.top = margin.y
          break

        case 'margin-right':
          if (!alteredProps.hasOwnProperty('margin')) {
            alteredProps.margin = {}
          }

          alteredProps.margin.right = margin.x
          break

        case 'margin-bottom':
          if (!alteredProps.hasOwnProperty('margin')) {
            alteredProps.margin = {}
          }

          alteredProps.margin.bottom = margin.y
          break

        case 'margin-left':
          if (!alteredProps.hasOwnProperty('margin')) {
            alteredProps.margin = {}
          }

          alteredProps.margin.left = margin.x
          break

        case 'padding':
          alteredProps.padding = props.padding
          break

        case 'padding-x':
          if (!alteredProps.hasOwnProperty('padding')) {
            alteredProps.padding = {}
          }

          alteredProps.padding.right = padding.x
          alteredProps.padding.left = padding.x
          break

        case 'padding-y':
          if (!alteredProps.hasOwnProperty('padding')) {
            alteredProps.padding = {}
          }

          alteredProps.padding.top = padding.y
          alteredProps.padding.bottom = padding.y
          break

        case 'padding-top':
          if (!alteredProps.hasOwnProperty('padding')) {
            alteredProps.padding = {}
          }

          alteredProps.padding.top = padding.y
          break

        case 'padding-right':
          if (!alteredProps.hasOwnProperty('padding')) {
            alteredProps.padding = {}
          }

          alteredProps.padding.right = padding.x
          break

        case 'padding-bottom':
          if (!alteredProps.hasOwnProperty('padding')) {
            alteredProps.padding = {}
          }

          alteredProps.padding.bottom = padding.y
          break

        case 'padding-left':
          if (!alteredProps.hasOwnProperty('padding')) {
            alteredProps.padding = {}
          }

          alteredProps.padding.left = padding.x
          break

        default: return
      }
    })

    return this._getApplyDecls(alteredProps)
  }

  applyProps () {
    let { args, atRule, source } = arguments[0]

    let type = args[0]
    let decls = []

    switch (type) {
      case 'inline-block':
        decls = this._getInlineBlockDecls(args, source)
        break
    }

    atRule.replaceWith(decls)
  }

  _getApplyDecls (props) {
    let { settings, typography, utils } = this.chassis
    let { fontSize, lineHeight } = this.baseTypography.root

    let decls = []

    let lineHeightMult = utils.unit.pxToEm(lineHeight, fontSize)
    let calcLineHeight = typography.calculateInlineHeight(lineHeightMult)

    if (props.hasOwnProperty('margin')) {
      let margin = []

      for (let edge in props.margin) {
        decls.push(utils.css.newDecl(`margin-${edge}`, props.margin[edge]))
      }
    }

    if (props.hasOwnProperty('padding')) {
      let padding = []

      for (let edge in props.padding) {
        decls.push(utils.css.newDecl(`padding-${edge}`, props.padding[edge]))
      }
    }


    return decls
  }

  inlineBlock () {
    let { settings, typography, utils } = this.chassis
    let { fontSize, lineHeight } = this.baseTypography.root
    let { args, atRule, source } = arguments[0]

    let hasArgs = args.length > 0

    let decls = []

    let lineHeightInEms = utils.unit.pxToEm(lineHeight, fontSize)
    let calcLineHeight = typography.calculateInlineHeight(lineHeightInEms)

    let margin = [null, `${typography.calculateInlineMarginX(lineHeightInEms)}em`, `${typography.calculateInlineMarginY(lineHeightInEms)}em`, null]
    let padding = [null, `${typography.calculateInlinePaddingX(lineHeightInEms)}em`, null, `${typography.calculateInlinePaddingX(lineHeightInEms)}em`]

    let addHeightRule = args.includes('add-height-rule')

    let stripMargin = args.includes('no-margin')
    let stripMarginBottom = args.includes('no-margin-bottom') || args.includes('no-margin-y')
    let stripMarginRight = args.includes('no-margin-right') || args.includes('no-margin-x')

    let stripPadding = args.includes('no-padding')
    let stripPaddingTop = args.includes('no-padding-top') || args.includes('no-padding-y')
    let stripPaddingRight = args.includes('no-padding-right') || args.includes('no-padding-x')
    let stripPaddingBottom = args.includes('no-padding-bottom') || args.includes('no-padding-y')
    let stripPaddingLeft = args.includes('no-padding-left') || args.includes('no-padding-x')

    let multiLine = args.includes('multi-line')
    let stripLineHeight = multiLine || args.includes('no-line-height')

    if (addHeightRule) {
      decls.push(utils.css.newDecl('height', `${calcLineHeight}em`))
    }

    if (stripMargin) {
      margin = null
    } else {
      if (stripMarginBottom) {
        margin[2] = null
      }

      if (stripMarginRight) {
        margin[1] = null
      }
    }

    if (margin && margin.some((value) => value !== null)) {
      margin.forEach((value, index) => {
        if (value) {
          decls.push(utils.css.newDecl(`margin-${this.dimensions[index]}`, value))
        }
      })
    }

    if (stripPadding) {
      padding = null
    } else {
      if (multiLine) {
        padding[0] = `${(calcLineHeight - lineHeightInEms) / 2}em`
        padding[2] = padding[0]
      }

      if (stripPaddingTop) {
        padding[0] = null
      }

      if (stripPaddingRight) {
        padding[1] = null
      }

      if (stripPaddingBottom) {
        padding[2] = null
      }

      if (stripPaddingLeft) {
        padding[3] = null
      }
    }

    if (padding && padding.some((value) => value !== null)) {
      padding.forEach((value, index) => {
        if (value) {
          decls.push(utils.css.newDecl(`padding-${this.dimensions[index]}`, value))
        }
      })
    }

    if (!stripLineHeight && !multiLine) {
      decls.push(utils.css.newDecl('line-height', calcLineHeight))
    }

    atRule.replaceWith(decls)
  }

  /**
	 * @mixin ellipsis
	 */
	ellipsis () {
		let { utils } = this.chassis
    let { atRule } = arguments[0]

		atRule.replaceWith([
			utils.css.newDecl('white-space', 'nowrap'),
			utils.css.newDecl('overflow', 'hidden'),
			utils.css.newDecl('text-overflow', 'ellipsis')
		])
	}

  fontSize () {
		let { constants, settings, typography, utils } = this.chassis
		let { args, atRule, source } = arguments[0]

		let alias = args[0]
		let multiplier = 1
		let addMargin = false

		if (!constants.typography.sizeAliases.includes(alias)) {
			console.error(`[ERROR] Line ${source.line}: Font size alias "${alias}" not found.  Accepted values: ${utils.string.listValues(constants.typography.sizeAliases)}`);
			atRule.remove()
			return
		}

		if (args.length > 0) {
			for (let i = 1; i < args.length; i++) {
				if (args[i].startsWith('mult')) {
					multiplier = parseFloat(utils.string.stripParentheses(args[i].replace('mult', '')))
				} else if (args[i] === 'add-margin') {
					addMargin = true
				} else {
					console.warn(`[WARNING] Line ${source.line}: Unkown argument "${arg}". Skipping...`)
				}
			}
		}

		if (isNaN(multiplier)) {
			console.warn(`[WARNING] Line ${source.line}: mult() value must be a valid decimal. Ignoring...`)
		}

		let decl = utils.css.newDecl(
			'font-size',
			`${utils.unit.pxToEm(typography.calculateFontSize(alias, multiplier), typography.calculateFontSize('root'))}rem`
		)

		atRule.replaceWith(decl)
  }
}

module.exports = ChassisTypographyMixins
