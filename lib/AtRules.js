// let native = [
//   'charset',
//   'custom-media',
//   'namespace',
//   'media',
//   'supports',
//   'document',
//   'import',
//   'page',
//   'font-face',
//   'keyframes',
//   'viewport',
//   'counter-style',
//   'font-feature-values',
//   'swash',
//   'ornaments',
//   'annotation',
//   'stylistic',
//   'styleset',
//   'character-variant',
//   'viewport'
// ]
//
// let chassis = [
//   'apply',
//   'font-size',
//   'line-height',
//   'media',
//   'component',
//   'config',
//   'constrain',
//   'export',
//   'import',
//   'interface',
//   'make',
//   'mixin',
//   'theme',
//   'selector',
//   'reset',
//   'z-index'
// ]

import Config from './data/Config.js'
import TypographyUtils from './utilities/TypographyUtils.js'

import media from './at-rules/media.js'

export default {
  apply: (atRule, cb) => {
    console.log('call apply')
    console.log(atRule)
  },

  'font-size': (atRule, cb) => {
    let { minFontSize } = Config.typography
    let fontSize = TypographyUtils.getFontSize(minFontSize, atRule.params)

    cb(null, `
      font-size: ${fontSize / minFontSize}rem;
    `)

    // line-height: ${TypographyUtils.calculateLineHeight()};
  },

  'line-height': (atRule, cb) => {
    console.log('call line-height')
    // console.log(atRule)
  },

  media (atRule, cb) {
    return media.process(...arguments)
  },

  // 'component': atRule => {
  //   console.log('call componenents')
  // },

  // 'config': atRule => {
  //   console.log('call config')
  // },

  constrain: (atRule, cb) => {
    console.log('call constrain')
    console.log(atRule)
  },

  // 'export': atRule => {
  //   console.log('call export')
  // },

  // 'import': atRule => {
  //   console.log('call import')
  // },

  // 'interface': atRule => {
  //   console.log('call interface')
  // },

  // make: atRule => {
  //   console.log('call make')
  // },

  // mixin: atRule => {
  //   console.log('call mixin': )
  // },

  // theme: atRule => {
  //   console.log('call theme': )
  // },

  // selector: atRule => {
  //   console.log('call selector)
  // },

  reset: (atRule, cb) => {
    console.log('call reset')
    console.log(atRule)
  },

  'z-index': (atRule, cb) => {
    console.log('call z-index')
    console.log(atRule)
  }
}
