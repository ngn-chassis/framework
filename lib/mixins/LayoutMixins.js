const postcss = require('postcss')
const parseValue = require('postcss-value-parser')

const ConsoleUtils = require('../utilities/ConsoleUtils.js')
const CSSUtils = require('../utilities/CSSUtils.js')
const ErrorUtils = require('../utilities/ErrorUtils.js')
const FileUtils = require('../utilities/FileUtils.js')
const LayoutUtils = require('../utilities/LayoutUtils.js')

const Config = require('../Config.js')

module.exports = class StyleSheetMixins {
  static constrain () {
    
  }

  /**
   * @mixin constrainWidth
   * Constrains the width of an element according to the provided parameters
   * @return {array} of decls
   */
  // static constrainWidth (mixin, cb) {
  //   let { constraints, gutter } = Config.layout
  //   let { width } = constraints
  //
  //   if (mixin.args.length > 0) {
  //     mixin.args.forEach(arg => {
  //       if (arg.type === 'function') {
  //         let value = parseValue.unit(arg.nodes[0].value).number
  //
  //         switch (arg.value) {
  //           case 'min':
  //             width.min = value
  //             break
  //
  //           case 'max':
  //             width.max = value
  //             break
  //
  //           case 'gutter':
  //             gutter.x = arg.nodes[0].value
  //             break
  //
  //           default: throw ErrorUtils.createError({
  //             file: mixin.source.file,
  //       			line: mixin.source.line,
  //             mixin: 'constrain-width',
  //       			message: `Unkown argument "${parseValue.stringify(arg)}"`
  //       		})
  //         }
  //       }
  //     })
  //   }
  //
  //   let { parent } = mixin.atRule
  //
  //   if (!parent.parent) {
  //     return cb(`Invalid usage: Must be placed within a CSS ruleset`)
  //   }
  //
  //   parent.parent.insertAfter(parent, CSSUtils.createMediaQuery(
  //     `screen and (max-width: ${width.min}px)`, [
  //       CSSUtils.createRule(parent.selector, [
  //         CSSUtils.createDeclObj('padding-left', LayoutUtils.getGutterLimit(width.min)),
  //         CSSUtils.createDeclObj('padding-right', LayoutUtils.getGutterLimit(width.min))
  //       ])
  //     ]
  //   ))
  //
  //   parent.parent.insertAfter(parent, CSSUtils.createMediaQuery(
  //     `screen and (min-width: ${width.max}px)`, [
  //       CSSUtils.createRule(parent.selector, [
  //         CSSUtils.createDeclObj('padding-left', LayoutUtils.getGutterLimit(width.max)),
  //         CSSUtils.createDeclObj('padding-right', LayoutUtils.getGutterLimit(width.max))
  //       ])
  //     ]
  //   ))
  //
  //   let decls = [
  //     CSSUtils.createDecl('width', '100%'),
  //     CSSUtils.createDecl('min-width', `${width.min}px`),
  //     CSSUtils.createDecl('max-width', `${width.max}px`),
  //     CSSUtils.createDecl('margin', '0 auto')
  //   ]
  //
  //   if (parseInt(gutter.x) !== 0) {
  //     decls.push(
  //       CSSUtils.createDecl('padding-left', gutter.x),
  //       CSSUtils.createDecl('padding-right', gutter.x)
  //     )
  //   }
  //
  //   cb(null, decls)
  // }
}
