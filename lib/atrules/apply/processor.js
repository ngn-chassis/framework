import { CONFIG } from '../../../index.js'

import ApplyRule from './ApplyRule.js'
import Application from './Application.js'

import CSSUtils from '../../utilities/CSSUtils.js'
import QueueUtils from '../../utilities/QueueUtils.js'
import TypographyUtils from '../../utilities/TypographyUtils.js'
import UnitUtils from '../../utilities/UnitUtils.js'

export default class {
  static process ({ atrule, stylesheet, theme }, resolve, reject) {
    let rule = new ApplyRule(atrule)

    rule.validate(err => {
      if (err) {
        return reject(err)
      }

      stylesheet.registerApplication(new Application(rule))
      rule.remove()

      resolve()

      // let application = new Application(rule)
      //
      // if (!application.bounds) {
      //   stylesheet.registerApplication(application)
      //   return resolve()
      // }
      //
      // let viewports = {
      //   min: application.bounds.min ? CONFIG.viewports.find(viewport => viewport.bounds.min >= application.bounds.min) : null,
      //   max: application.bounds.max ? CONFIG.viewports.find(viewport => viewport.bounds.max >= application.bounds.max) : null
      // }
      //
      // let buffer = [0,0]
      //
      // if (viewports.min && viewports.min.bounds.max < application.bounds.min) {
      //   buffer[0] = application.bounds.min - viewports.min.bounds.min
      // }
      //
      // if (viewports.max && viewports.max.bounds.max > application.bounds.max) {
      //   buffer[1] = application.bounds.max - viewports.max.bounds.max
      // }
      //
      // let query = CSSUtils.createAtRule({
      //   name: 'media',
      //   params: `screen${viewports.min ? ` and (min-width: ${viewports.min.bounds.min - buffer[0]}px)` : ''}${viewports.max ? ` and (max-width: ${viewports.max.bounds.max + buffer[1]}px)` : ''}`,
      //   nodes: [
      //     CSSUtils.createDecl('font-size', '2em'),
      //     CSSUtils.createDecl('line-height', '2')
      //   ]
      // })
      //
      // // application.replaceWith(query)
      // resolve()

      // let viewports = CONFIG.viewports.reduce((results, viewport, index, viewports) => {
      //   if (application.bounds.min < viewport.bounds.min) {
      //
      //   }
      // }, {
      //   min: null,
      //   max: null,
      //   buffer: []
      // })

      // let viewport = CONFIG.viewports.find(viewport => viewport.bounds.min === application.bounds.min && viewport.bounds.max === application.bounds.max)
      //
      // if (!!viewport) {
      //   // TODO: Store source data in the typeset so that source maps point to the right place
      //   return CONFIG.storeApplication(viewport.name, application, err => err ? reject(err) : resolve())
      // }
      //
      // let viewports = {
      //   min: CONFIG.viewports.find(viewport => viewport.bounds.min === application.bounds.min),
      //   max: CONFIG.viewports.find(viewport => viewport.bounds.max === application.bounds.max)
      // }
      //
      // console.log(viewports);
      // // return this.#renderApplication(stylesheet, atrule, application, resolve, reject)
    })
  }

  static #processTypeset = (decls, stylesheet, typeset, resolve, reject) => {
    if (!typeset.bounds) {
      stylesheet.registerApply(typeset)
      return resolve()
    }

    let viewport = CONFIG.viewports.find(viewport => viewport.bounds.min === typeset.bounds.min && viewport.bounds.max === typeset.bounds.max)

    if (!viewport) {
      return console.log('Render Apply in place')
      // return this.#renderApply(stylesheet, atrule, typeset, resolve, reject)
    }

    // TODO: Store source data in the typeset so that source maps point to the right place
    CONFIG.storeApply(viewport.name, rule, err => err ? reject(err) : resolve())
  }

  static #renderApplication = (stylesheet, atrule, application, resolve, reject) => {
    console.log(application);
  }

  // static #renderTypeset = (stylesheet, atrule, typeset, resolve, reject) => {
  //   let fontSize = TypographyUtils.getFontSize(CONFIG.typography.baseFontSize, typeset.size)
  //   let { min, max } = typeset.bounds
  //
  //   min = NGN.coalesce(min, 0)
  //
  //   stylesheet.registerTypeset(typeset)
  //   atrule.remove()
  //   // TODO: Store source
  //
  //   resolve()
  // }

  // static #processRule = (stylesheet, rule, resolve, reject) => {
  //   console.log(rule.bounds);
  //
  //   // let decls = []
  //   // let tasks = []
  //   //
  //   // if (rule.typeset) {
  //   //   tasks.push({
  //   //     name: 'Processing Typeset',
  //   //     callback: next => this.#processTypeset(decls, stylesheet, rule.typeset, next, reject)
  //   //   })
  //   // }
  //   //
  //   // QueueUtils.run({
  //   //   log: false,
  //   //   tasks
  //   // })
  //   // .then(resolve)
  //   // .catch(reject)
  // }
}
