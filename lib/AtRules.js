import Config from './data/Config.js'

import CSSUtils from './utilities/CSSUtils.js'
import TypographyUtils from './utilities/TypographyUtils.js'

import extend from './atrules/extend/processor.js'
import implement from './atrules/new/processor.js'
import media from './atrules/media/processor.js'

export default class AtRules {
  static apply (atrule, cb) {
    console.log('call apply')
    console.log(atrule)
  }

  static constrain (atrule, cb) {
    console.log('call constrain')
    console.log(atrule)
  }

  static media (atrule, cb) {
    return media.process(...arguments)
  }

  static typeset ({ stylesheet, atrule }, resolve, reject) {
    let rule = CSSUtils.createRule('typeset')
    let increment = atrule.params
    let { min } = Config.typography.fontSize
    let fontSize = TypographyUtils.getFontSize(increment)

    rule.append(`
      font-size: ${fontSize / min}rem;
      line-height: ${TypographyUtils.getProportionalLineHeight(increment)}
    `)

    atrule.replaceWith(rule.nodes)
    resolve()
  }

  static extend () {
    return extend.process(...arguments)
  }

  static new (atrule, cb) {
    return implement.process(...arguments)
  }

  static reset (atrule, cb) {
    console.log('call reset')
    console.log(atrule)
  }

  static 'z-index' (atrule, cb) {
    console.log('call z-index')
    console.log(atrule)
  }

  // 'component': atrule => {
  //   console.log('call componenents')
  // },

  // 'config': atrule => {
  //   console.log('call config')
  // },

  // 'export': atrule => {
  //   console.log('call export')
  // },

  // 'import': atrule => {
  //   console.log('call import')
  // },

  // 'interface': atrule => {
  //   console.log('call interface')
  // },

  // make: atrule => {
  //   console.log('call make')
  // },

  // mixin: atrule => {
  //   console.log('call mixin': )
  // },

  // theme: atrule => {
  //   console.log('call theme': )
  // },

  // selector: atrule => {
  //   console.log('call selector)
  // }
}
