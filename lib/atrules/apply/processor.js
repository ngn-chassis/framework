import Config from '../../data/Config.js'

import ApplyRule from './ApplyRule.js'
import TypesetRule from './TypesetRule.js'
import DisplayRule from './DisplayRule.js'
import Typeset from '../../Typeset.js'

import TypographyUtils from '../../utilities/TypographyUtils.js'
import UnitUtils from '../../utilities/UnitUtils.js'

export default class {
  static process ({ atrule, stylesheet }, resolve, reject) {
    let rule = new ApplyRule(atrule)

    switch (rule.type) {
      case 'typeset': return this.#processTypeset(stylesheet, atrule, new TypesetRule(rule.root), resolve, reject)

      case 'block':
      case 'inline-block':
      case 'inline': return this.#processDisplay(stylesheet, atrule, new DisplayRule(rule.root), resolve, reject)

      default: return reject(atrule.error(`\nInvalid @apply rule "${rule.type}"`, { word: rule.type }))
    }
  }

  static #processDisplay = (stylesheet, atrule, displayrule, resolve, reject) => {
    console.log('DISPLAY')
    console.log(atrule);
  }

  static #processTypeset = (stylesheet, atrule, typesetrule, resolve, reject) => {
    let typeset = new Typeset(typesetrule)

    typeset.validate(() => {
      if (!typeset.bounds) {
        stylesheet.registerTypeset(typeset)
        return resolve()
      }

      let viewport = Config.viewports.find(viewport => viewport.bounds.min === typeset.bounds.min && viewport.bounds.max === typeset.bounds.max)

      if (!viewport) {
        return this.#renderTypeset(stylesheet, atrule, typeset, resolve, reject)
      }

      // TODO: Store source data in the typeset so that source maps point to the right place
      stylesheet.storeTypeset(viewport.name, typeset, err => {
        if (err) {
          return reject(err)
        }

        atrule.remove()
        resolve()
      })
    })
  }

  static #renderTypeset = (stylesheet, atrule, typeset, resolve, reject) => {
    let fontSize = TypographyUtils.getIncrementedFontSize(Config.typography.baseFontSize, typeset.increment)
    let { min, max } = typeset.bounds

    min = NGN.coalesce(min, 0)

    stylesheet.registerTypeset(typeset)
    atrule.remove()
    // TODO: Store source

    resolve()
  }
}
