module.exports = class ChassisLayoutMixins {
  constructor (chassis) {
    Object.defineProperties(this, {
      chassis: NGN.privateconst(chassis)
    })
  }

  /**
   * @mixin constrainWidth
   * @return {array} of decls
   */
  constrainWidth () {
    let { layout, settings, utils } = this.chassis
    let { args, atRule, nodes, root, source } = arguments[0]
    let { minWidth, maxWidth, gutter } = settings.layout
    let { parent } = atRule

    if (args && args.length > 0) {
      args.forEach(arg => {
        if (arg.startsWith('min')) {
          minWidth = utils.string.stripParentheses(arg.replace('min', ''))
        } else if (arg.startsWith('max')) {
          maxWidth = utils.string.stripParentheses(arg.replace('max', ''))
        } else if (arg.startsWith('gutter')) {
          gutter = utils.string.stripParentheses(arg.replace('gutter', ''))
        } else {
          console.warn(`[WARNING] Line ${source.line}: Unkown argument "${arg}". Skipping...`)
        }
      })
    }

    root.insertAfter(parent, utils.css.createMediaQuery(
      `screen and (max-width: ${minWidth}px)`, [
        utils.css.createRule(parent.selector, [
          utils.css.createDeclObj('padding-left', layout.getGutterLimit(minWidth)),
          utils.css.createDeclObj('padding-right', layout.getGutterLimit(minWidth))
        ])
      ]
    ))

    root.insertAfter(parent, utils.css.createMediaQuery(
      `screen and (min-width: ${maxWidth}px)`, [
        utils.css.createRule(parent.selector, [
          utils.css.createDeclObj('padding-left', layout.getGutterLimit(maxWidth)),
          utils.css.createDeclObj('padding-right', layout.getGutterLimit(maxWidth))
        ])
      ]
    ))

    let decls = [
      utils.css.createDecl('width', '100%'),
      utils.css.createDecl('min-width', `${minWidth}px`),
      utils.css.createDecl('max-width', `${maxWidth}px`),
      utils.css.createDecl('margin', '0 auto')
    ]

    if (parseInt(gutter) !== 0) {
      decls = [
        ...decls,
        utils.css.createDecl('padding-left', gutter),
        utils.css.createDecl('padding-right', gutter)
      ]
    }

    atRule.replaceWith(decls)
  }

  /**
   * @mixin zIndex
   * Get calculated z-index value from project settings
   */
  zIndex () {
    let { settings, utils } = this.chassis
    let { args, atRule, source } = arguments[0]

    let index = settings.data.zIndex[args[0]]

    if (!index) {
      console.error(`[ERROR] Line ${source.line}: Invalid z-index alias. Accepted values: ${utils.string.listValues(settings.zIndex)}`)
    }

    atRule.replaceWith(utils.css.createDecl('z-index', index))
  }
}
