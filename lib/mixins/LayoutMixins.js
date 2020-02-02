const postcss = require('postcss')
const parseValue = require('postcss-value-parser')

const ConsoleUtils = require('../utilities/ConsoleUtils.js')
const CSSUtils = require('../utilities/CSSUtils.js')
const ErrorUtils = require('../utilities/ErrorUtils.js')
const FileUtils = require('../utilities/FileUtils.js')
const LayoutUtils = require('../utilities/LayoutUtils.js')

const Config = require('../Config.js')

module.exports = class StyleSheetMixins {
  /**
   * @mixin constrainWidth
   * Constrains the width of an element according to the provided parameters
   * @return {array} of decls
   */
  static constrainWidth (mixin, cb) {
    let { minWidth, maxWidth, gutter, getGutterLimit } = Config.layout

    if (mixin.args.length > 0) {
      mixin.args.forEach(arg => {
        if (arg.type === 'function') {
          let value = parseValue.unit(arg.nodes[0].value).number

          switch (arg.value) {
            case 'min':
              minWidth = value
              break

            case 'max':
              maxWidth = value
              break

            case 'gutter':
              gutter = arg.nodes[0].value
              break

            default: throw ErrorUtils.createError({
              file: mixin.source.file,
        			line: mixin.source.line,
              mixin: 'constrain-width',
        			message: `Unkown argument "${parseValue.stringify(arg)}"`
        		})
          }
        }
      })
    }

    let { parent } = mixin.atRule

    if (!parent.parent) {
      return cb(`Invalid usage: Must be placed within a CSS ruleset`)
    }

    parent.parent.insertAfter(parent, CSSUtils.createMediaQuery(
      `screen and (max-width: ${minWidth}px)`, [
        CSSUtils.createRule(parent.selector, [
          CSSUtils.createDeclObj('padding-left', LayoutUtils.getGutterLimit(minWidth)),
          CSSUtils.createDeclObj('padding-right', LayoutUtils.getGutterLimit(minWidth))
        ])
      ]
    ))

    parent.parent.insertAfter(parent, CSSUtils.createMediaQuery(
      `screen and (min-width: ${maxWidth}px)`, [
        CSSUtils.createRule(parent.selector, [
          CSSUtils.createDeclObj('padding-left', LayoutUtils.getGutterLimit(maxWidth)),
          CSSUtils.createDeclObj('padding-right', LayoutUtils.getGutterLimit(maxWidth))
        ])
      ]
    ))

    let decls = [
      CSSUtils.createDecl('width', '100%'),
      CSSUtils.createDecl('min-width', `${minWidth}px`),
      CSSUtils.createDecl('max-width', `${maxWidth}px`),
      CSSUtils.createDecl('margin', '0 auto')
    ]

    if (parseInt(gutter) !== 0) {
      decls.push(
        CSSUtils.createDecl('padding-left', gutter),
        CSSUtils.createDecl('padding-right', gutter)
      )
    }

    cb(null, decls)
  }
}
