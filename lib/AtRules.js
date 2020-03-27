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
import CSSUtils from './utilities/CSSUtils.js'
import ErrorUtils from './utilities/ErrorUtils.js'
import ViewportUtils from './utilities/ViewportUtils.js'

export default {
  apply: (atRule, cb) => {
    console.log('call apply')
    console.log(atRule)
  },

  'font-size': (atRule, cb) => {
    console.log('call font-size')
    console.log(atRule)
  },

  'line-height': (atRule, cb) => {
    console.log('call line-height')
    console.log(atRule)
  },

  media: (atRule, cb) => {
    let func = atRule.args[0]

    if (func.type !== 'function') {
      return cb(null, null, false)
    }

    if (atRule.args.length > 1) {
      return cb(`Invalid media query`)
    }

    let modifiers = func.nodes.slice(1).reduce((acc, modifier) => {
      if (!['word', 'string'].some(type => modifier.type === type)) {
        return acc
      }

      let adjustment = parseInt(modifier.value)

      if (isNaN(adjustment)) {
        return cb([
          `Invalid modifier "${modifier.toString()}". Modifier must be a number prefixed with "+" or "-".`,
          `Ex) +200 | -200 | +-200`
        ])
      }

      acc.push(adjustment)
      return acc
    }, [])

    let { generatedRanges } = Config
    let rangeName = func.nodes[0].value
    let range = generatedRanges.find(range => range.name === rangeName.slice(2))

    if (!range) {
      return cb([
        `Invalid viewport range "${rangeName}". Available viewport ranges:`,
        ...generatedRanges.map(range => `  --${range.name}`)
      ])
    }

    let bounds = Object.assign({}, range.bounds)

    modifiers.forEach(adj => {
      if (adj === 0) {
        return cb(null, null, false)
      }

      if (!bounds.min) {
        bounds.max += adj
      } else if (!bounds.max) {
        bounds.min += adj
      } else if (adj < 0) {
        bounds.min += adj
      } else if (adj > 0) {
        bounds.max += adj
      }
    })

    cb(null, CSSUtils.createRoot([
      ViewportUtils.generateQuery({
        bounds,
        type: range.type
      }, atRule.nodes)
    ]))
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
