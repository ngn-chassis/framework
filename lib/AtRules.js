import Config from './data/Config.js'
import AtRule from './atrules/AtRule.js'

import CSSUtils from './utilities/CSSUtils.js'
import TypographyUtils from './utilities/TypographyUtils.js'

import extend from './atrules/extend/processor.js'
import implement from './atrules/new/processor.js'
import media from './atrules/media/processor.js'

export default class AtRules {
  static apply (data, cb) {
    console.log('call apply')
    console.log(data)
  }

  static constrain (data, cb) {
    console.log('call constrain')
    console.log(data)
  }

  static media (data, cb) {
    return media.process(...arguments)
  }

  static extend () {
    return extend.process(...arguments)
  }

  static new (data, cb) {
    return implement.process(...arguments)
  }

  static reset (data, cb) {
    console.log('call reset')
    console.log(data)
  }

  static 'z-index' (data, cb) {
    console.log('call z-index')
    console.log(data)
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
