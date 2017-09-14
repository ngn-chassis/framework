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

  inlineBlockLayout () {
    let { settings, typography, utils } = this.chassis
    let { fontSize, lineHeight } = this.baseTypography.root
    let { args, atRule, source } = arguments[0]

    let decls = []

    let lineHeightInEms = utils.units.toEms(lineHeight, fontSize)
    let calcLineHeight = typography.calculateInlineHeight(lineHeightInEms)

    let margin = [null, `${typography.calculateInlineMarginX(lineHeightInEms)}em`, `${typography.calculateInlineMarginY(lineHeightInEms)}em`, null]
    let padding = [null, `${typography.calculateInlinePaddingX(lineHeightInEms)}em`, null, `${typography.calculateInlinePaddingX(lineHeightInEms)}em`]

    let stripMargin = args.includes('no-margin')
    let stripMarginBottom = args.includes('no-margin-bottom')
    let stripMarginRight = args.includes('no-margin-right')

    let stripPadding = args.includes('no-padding')
    let stripPaddingTop = args.includes('no-padding-top')
    let stripPaddingRight = args.includes('no-padding-right')
    let stripPaddingBottom = args.includes('no-padding-bottom')
    let stripPaddingLeft = args.includes('no-padding-left')

    let multiLine = args.includes('multi-line')
    let stripLineHeight = multiLine || args.includes('no-line-height')

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
      decls.push(utils.css.newDecl('line-height', `${calcLineHeight}em`))
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
			`${utils.units.toEms(typography.calculateFontSize(alias, multiplier), typography.calculateFontSize('root'))}rem`
		)

		atRule.replaceWith(decl)
  }
}

module.exports = ChassisTypographyMixins
