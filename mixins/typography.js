module.exports = (function () {
  let _ = new WeakMap()

  return class ChassisTypographyMixins {
    constructor (chassis) {
      _.set(this, {
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

        getPillVariationDecls: (args, source) => {
          let { settings, typography, utils } = _.get(this).chassis
          let { fontSize, lineHeight } = _.get(this).baseTypography.root

          args = _.get(this).cleanseArgs(args, [
            'pill',
            'padding',
            'padding-x',
            'padding-y',
            'padding-top',
            'padding-right',
            'padding-bottom',
            'padding-left',
            'radius',
            'radius-top',
            'radius-top-left',
            'radius-top-right',
            'radius-right',
            'radius-bottom',
            'radius-bottom-left',
            'radius-bottom-right',
            'radius-left',
          ])

          let lineHeightMult = utils.unit.pxToEm(lineHeight, fontSize)
          let calcLineHeight = typography.calculateInlineHeight(lineHeightMult)
          let hasArgs = args.length > 1

          let padding = {
            x: `${settings.typography.scaleRatio}em`,
            y: `${typography.calculateInlinePaddingY(lineHeightMult)}em`
          }

          let props = {
            padding: {
              top: padding.y,
              right: padding.x,
              bottom: padding.y,
              left: padding.x
            },
            borderRadius: `${lineHeightMult}em`
          }

          if (!hasArgs) {
            return _.get(this).getApplyDecls(props)
          }

          let alteredProps = {}

          if (args.some(arg => arg.includes('padding'))) {
            alteredProps.padding = {}
          }

          if (args.some(arg => arg.includes('radius'))) {
            alteredProps.borderRadius = [0, 0, 0, 0]
          }

          args.forEach(arg => {
            switch (arg) {
              case 'padding':
                alteredProps.padding = props.padding
                break

              case 'padding-x':
                alteredProps.padding.right = padding.x
                alteredProps.padding.left = padding.x
                break

              case 'padding-y':
                alteredProps.padding.top = padding.y
                alteredProps.padding.bottom = padding.y
                break

              case 'padding-top':
                alteredProps.padding.top = padding.y
                break

              case 'padding-right':
                alteredProps.padding.right = padding.x
                break

              case 'padding-bottom':
                alteredProps.padding.bottom = padding.y
                break

              case 'padding-left':
                alteredProps.padding.left = padding.x
                break

              case 'radius':
                alteredProps.borderRadius = props.borderRadius
                break

              case 'radius-top':
                alteredProps.borderRadius[0] = props.borderRadius
                alteredProps.borderRadius[1] = props.borderRadius
                break

              case 'radius-bottom':
                alteredProps.borderRadius[2] = props.borderRadius
                alteredProps.borderRadius[3] = props.borderRadius
                break

              case 'radius-right':
                alteredProps.borderRadius[1] = props.borderRadius
                alteredProps.borderRadius[2] = props.borderRadius
                break

              case 'radius-left':
                alteredProps.borderRadius[0] = props.borderRadius
                alteredProps.borderRadius[3] = props.borderRadius
                break

              case 'radius-top-left':
                alteredProps.borderRadius[0] = props.borderRadius
                break

              case 'radius-top-right':
                alteredProps.borderRadius[1] = props.borderRadius
                break

              case 'radius-bottom-right':
                alteredProps.borderRadius[2] = props.borderRadius
                break

              case 'radius-bottom-left':
                alteredProps.borderRadius[3] = props.borderRadius
                break

              default: return
            }
          })

          return _.get(this).getApplyDecls(alteredProps)
        },

        getInlineBlockDecls: (args, source) => {
          let { settings, typography, utils } = _.get(this).chassis
          let { fontSize, lineHeight } = _.get(this).baseTypography.root

          args = _.get(this).cleanseArgs(args, [
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
            return _.get(this).getApplyDecls(props)
          }

          let alteredProps = {}

          if (args.some(arg => arg.includes('padding'))) {
            alteredProps.padding = {}
          }

          if (args.some(arg => arg.includes('margin'))) {
            alteredProps.margin = {}
          }

          args.forEach(arg => {
            switch (arg) {
              case 'rtl':
                alteredProps.margin.left = margin.x

                if (alteredProps.margin.hasOwnProperty('right')) {
                  delete alteredProps.margin.right
                }
                break

              case 'margin':
                alteredProps.margin = props.margin
                break

              case 'margin-x':
                alteredProps.margin.right = margin.x
                alteredProps.margin.left = margin.x
                break

              case 'margin-y':
                alteredProps.margin.top = margin.y
                alteredProps.margin.bottom = margin.y
                break

              case 'margin-top':
                alteredProps.margin.top = margin.y
                break

              case 'margin-right':
                alteredProps.margin.right = margin.x
                break

              case 'margin-bottom':
                alteredProps.margin.bottom = margin.y
                break

              case 'margin-left':
                alteredProps.margin.left = margin.x
                break

              case 'padding':
                alteredProps.padding = props.padding
                break

              case 'padding-x':
                alteredProps.padding.right = padding.x
                alteredProps.padding.left = padding.x
                break

              case 'padding-y':
                alteredProps.padding.top = padding.y
                alteredProps.padding.bottom = padding.y
                break

              case 'padding-top':
                alteredProps.padding.top = padding.y
                break

              case 'padding-right':
                alteredProps.padding.right = padding.x
                break

              case 'padding-bottom':
                alteredProps.padding.bottom = padding.y
                break

              case 'padding-left':
                alteredProps.padding.left = padding.x
                break

              default: return
            }
          })

          return _.get(this).getApplyDecls(alteredProps)
        },

        getApplyDecls: props => {
          let { utils } = _.get(this).chassis
          let decls = []

          if (props.hasOwnProperty('margin')) {
            for (let edge in props.margin) {
              decls.push(utils.css.newDecl(`margin-${edge}`, props.margin[edge]))
            }
          }

          if (props.hasOwnProperty('padding')) {
            for (let edge in props.padding) {
              decls.push(utils.css.newDecl(`padding-${edge}`, props.padding[edge]))
            }
          }

          if (props.hasOwnProperty('borderRadius')) {
            if (typeof props.borderRadius === 'string') {
              decls.push(utils.css.newDecl('border-radius', props.borderRadius))
            } else if (Array.isArray(props.borderRadius)) {
              decls.push(utils.css.newDecl('border-radius', props.borderRadius.join(' ')))
            }
          }

          return decls.length ? decls : null
        }
      })
    }

    applyProps () {
      let { args, atRule, source } = arguments[0]

      let type = args[0]
      let decls = null

      switch (type) {
        case 'inline-block':
          decls = _.get(this).getInlineBlockDecls(args, source)
          break

        default:
          console.warn(`[WARNING] Chassis apply mixin: No property type specified. Discarding...`)
          break
      }

      if (!decls) {
        return atRule.remove()
      }

      atRule.replaceWith(decls)
    }

    applyVariation () {
      let { args, atRule, source } = arguments[0]

      let type = args[0]
      let decls = null

      switch (type) {
        case 'pill':
          decls = _.get(this).getPillVariationDecls(args, source)
          break

        default:
          console.warn(`[WARNING] Chassis apply-variation mixin: No variation type specified. Discarding...`)
          break
      }

      if (!decls) {
        return atRule.remove()
      }

      atRule.replaceWith(decls)
    }

    /**
  	 * @mixin ellipsis
  	 */
  	ellipsis () {
  		let { utils } = _.get(this).chassis
      let { atRule } = arguments[0]

  		atRule.replaceWith([
  			utils.css.newDecl('white-space', 'nowrap'),
  			utils.css.newDecl('overflow', 'hidden'),
  			utils.css.newDecl('text-overflow', 'ellipsis')
  		])
  	}

    fontSize () {
  		let { constants, settings, typography, utils } = _.get(this).chassis
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
