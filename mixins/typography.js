const ChassisTypographyMixins = (function () {
  let _private = new WeakMap()

  return class {
    constructor (chassis) {
      _private.set(this, {
        chassis,
        baseTypography: chassis.settings.typography.ranges.first.typography,

        cleanseArgs: (args, validArgs) => {
          return args.map(arg => {
            if (!validArgs.includes(arg)) {
              console.error(`[ERROR] Chassis apply mixin: Invalid argument "${arg}". Discarding...`);
              return
            }

            return arg
          }).filter(Boolean)
        },

        getInlineBlockDecls: (args, source) => {
          let { settings, typography, utils } = _private.get(this).chassis
          let { fontSize, lineHeight } = _private.get(this).baseTypography.root

          args = _private.get(this).cleanseArgs(args, [
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
            y: `${typography.calculateInlinePaddingY(lineHeightMult)}em`
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
            return _private.get(this).getApplyDecls(props)
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

          return _private.get(this).getApplyDecls(alteredProps)
        },

        getApplyDecls: props => {
          let { settings, typography, utils } = _private.get(this).chassis
          let { fontSize, lineHeight } = _private.get(this).baseTypography.root

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
      })
    }

    applyProps () {
      let { args, atRule, source } = arguments[0]

      let type = args[0]
      let decls = []

      switch (type) {
        case 'inline-block':
          decls = _private.get(this).getInlineBlockDecls(args, source)
          break
      }

      atRule.replaceWith(decls)
    }

    /**
  	 * @mixin ellipsis
  	 */
  	ellipsis () {
  		let { utils } = _private.get(this).chassis
      let { atRule } = arguments[0]

  		atRule.replaceWith([
  			utils.css.newDecl('white-space', 'nowrap'),
  			utils.css.newDecl('overflow', 'hidden'),
  			utils.css.newDecl('text-overflow', 'ellipsis')
  		])
  	}

    fontSize () {
  		let { constants, settings, typography, utils } = _private.get(this).chassis
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
})()

module.exports = ChassisTypographyMixins
