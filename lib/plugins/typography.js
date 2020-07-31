import postcss from 'postcss'
import parser from 'postcss-scss'

import { CONFIG } from '../../index.js'

import ApplyRule from '../atrules/apply/ApplyRule.js'
import Application from '../atrules/apply/Application.js'

import CSSUtils from '../utilities/CSSUtils.js'
import LayoutUtils from '../utilities/LayoutUtils.js'
import TypographyUtils from '../utilities/TypographyUtils.js'
import UnitUtils from '../utilities/UnitUtils.js'

export default postcss.plugin('chassis-typography', (annotations, theme) => {
  return (root, result) => new Promise((resolve, reject) => {
    if (!annotations.hasOwnProperty('typography')) {
      return resolve(root)
    }

    let typography = new TypographyEngine(theme, CONFIG.viewports)
    let rules = CSSUtils.createRoot()

    rules.append(typography.renderInitialHeadings(true))

    root.walkAtRules('apply', atrule => typography.addApplication(new ApplyRule(atrule)))
    rules.walkAtRules('apply', atrule => typography.addApplication(new ApplyRule(atrule)))

    rules.append(typography.renderInitialApplications())
    rules.append(typography.renderViewports())

    annotations.typography.replaceWith(parser.parse(rules, { from: 'chassis.typography' }))
    resolve(root)
  })
})

class TypographyEngine {
  #applications = []
  #initialApplications = []
  #orphanApplications = []
  #theme
  #viewports
  #headingSelectors = [...[...Array(7).keys()].slice(1).map(n => `h${n}`), 'legend']

  constructor (theme, viewports) {
    this.#theme = theme
    this.#viewports = viewports
  }

  get applications () {
    return {
      unbounded: this.#applications,
      orphaned: this.#orphanApplications,
      initial: this.#initialApplications
    }
  }

  get viewports () {
    return this.#viewports
  }

  addApplication (applyRule) {
    let application = new Application(applyRule)
    applyRule.remove()

    if (!application.bounds) {
      return this.#applications.push(application)
    }

    let viewports = {
      min: application.bounds.min ? CONFIG.viewports.find(viewport => viewport.bounds.min >= application.bounds.min) : null,
      max: application.bounds.max ? CONFIG.viewports.find(viewport => viewport.bounds.max >= application.bounds.max) : null
    }

    let buffer = [0,0]

    if (viewports.min && viewports.min.bounds.max < application.bounds.min) {
      buffer[0] = application.bounds.min - viewports.min.bounds.min
    }

    if (viewports.max && viewports.max.bounds.max > application.bounds.max) {
      buffer[1] = application.bounds.max - viewports.max.bounds.max
    }

    if (!viewports.min || !viewports.max) {
      let viewport = viewports.min ?? viewports.max

      switch (viewport) {
        case viewports.min: return this.#registerApplication(application, viewports.min)
        case viewports.max: return this.#registerApplication(application, null, viewports.max)
      }
    }

    if (viewports.min.name === viewports.max.name) {
      let viewport = this.#viewports.find(viewport => viewport.name === viewports.min.name)
      return viewport.applications.push(application)
    }

    console.log(`IN BETWEEN - render at viewports falling completely within the bounds of the application, and add additional queries for buffer`)
    this.#orphanApplications.push(application)
  }

  renderApplication (application, width = CONFIG.layout.width.min, fontSize = CONFIG.typography.baseFontSize, columns = 1) {
    if (application.typeset) {
      fontSize = TypographyUtils.getFontSize(CONFIG.typography.baseFontSize, application.typeset.size)
    }

    let lineHeight = TypographyUtils.getOptimalLineHeight(fontSize, width, columns)

    let cfg = {
      selector: application.selector,
      decls: []
    }

    if (application.typeset) {
      if (!application.typeset.sizeSet) {
        cfg.fontSize = fontSize
        application.typeset.sizeSet = true
      }

      cfg.lineHeight = lineHeight
    }

    if (application.margin) {
      cfg.decls.push(...this.#getLayoutDecls('margin', application.margin, fontSize, lineHeight, width, columns))
    }

    if (application.padding) {
      cfg.decls.push(...this.#getLayoutDecls('padding', application.padding, fontSize, lineHeight, width, columns))
    }

    let typeset = parser.parse(this.renderTypeset(cfg)).nodes[0]
    // typeset.source = application.source
    // application.root.remove()

    // if (typeset.nodes.length === 0) {
    //   return null
    // }

    return typeset
  }

  #getLayoutDecls = (type, cfg, fontSize, lineHeight, width, columns) => {
    if (cfg.typeset !== 0) {
      fontSize = TypographyUtils.getFontSize(CONFIG.typography.baseFontSize, cfg.typeset)
      lineHeight = TypographyUtils.getOptimalLineHeight(fontSize, width, columns)
    }

    let process = (...args) => {
      switch (type) {
        case 'margin': return LayoutUtils.getMargin(...args)
        case 'padding': return LayoutUtils.getPadding(...args)
        // default: TODO: Throw Error
      }
    }

    let values = {
      top: cfg.top ? process(cfg.display, 'top', lineHeight, cfg.top) : null,
      right: cfg.right ? process(cfg.display, 'right', lineHeight, cfg.right) : null,
      bottom: cfg.bottom ? process(cfg.display, 'bottom', lineHeight, cfg.bottom) : null,
      left: cfg.left ? process(cfg.display, 'left', lineHeight, cfg.left) : null
    }

    let decls = []
    let dimensions = ['top', 'right', 'bottom', 'left']

    if (dimensions.every(dimension => !!values[dimension])) {
      return [CSSUtils.createDecl(type, `${values.top}em ${values.right}em ${values.bottom}em ${values.left}em`)]
    }

    if (values.top) {
      decls.push(CSSUtils.createDecl(`${type}-top`, `${values.top}em`))
    }

    if (values.right) {
      decls.push(CSSUtils.createDecl(`${type}-right`, `${values.right}em`))
    }

    if (values.bottom) {
      decls.push(CSSUtils.createDecl(`${type}-bottom`, `${values.bottom}em`))
    }

    if (values.left) {
      decls.push(CSSUtils.createDecl(`${type}-left`, `${values.left}em`))
    }

    return decls
  }

  renderInitialApplications () {
    let root = CSSUtils.createRoot()
    let { unbounded, initial } = this.applications

    ;[...unbounded, ...initial].forEach(application => {
      root.append(this.renderApplication(application))
    })

    return root
  }

  renderInitialHeadings () {
    let root = CSSUtils.createRoot()

    this.#headingSelectors.forEach(selector => {
      root.append(this.renderHeading(selector, true, true, CONFIG.layout.width.min, this.#theme.getHeading(selector)))
    })

    return root
  }

  renderHeading (selector, includeFontSize, includeLineHeight, width, decls = []) {
    let rule = CSSUtils.createRule(selector)
    let fontSize = TypographyUtils.getFontSize(CONFIG.typography.baseFontSize, CONFIG.typography.headings[selector])

    if (includeFontSize) {
      rule.append(CSSUtils.createDecl('font-size', `${UnitUtils.pxToRelative(fontSize)}rem`))
    }

    if (includeLineHeight) {
      rule.append(CSSUtils.createDecl('line-height', TypographyUtils.getOptimalLineHeight(fontSize, width)))
    }

    rule.append(decls)
    return rule
  }

  renderTypeset ({ selector, fontSize, lineHeight, decls }) {
    // let adjustedFontSize = TypographyUtils.getFontSize(CONFIG.typography.baseFontSize, size)
    let rule = CSSUtils.createRule(selector)

    if (fontSize) {
      rule.append(`font-size: ${UnitUtils.pxToRelative(fontSize)}rem;`)
    }

    if (lineHeight) {
      rule.append(`line-height: ${lineHeight}`)
    }

    if (decls) {
      rule.append(decls)
    }

    return rule
  }

  renderViewports () {
    let root = CSSUtils.createRoot()
    let fontSize = CONFIG.typography.baseFontSize

    this.#viewports.forEach((viewport, i) => {
      if (!viewport.bounds.min) {
        return
      }

      let query = CSSUtils.createAtRule({
        name: 'media',
        params: `screen and (min-width: ${viewport.bounds.min}px)`
      })

      root.append(CSSUtils.createComment(`${viewport.name}`))

      let columns = viewport.columns ?? 1

      if (viewport.type !== 'range') {
        if (viewport.bounds.max !== CONFIG.layout.width.max) {
          query.params += ` and (max-width: ${viewport.bounds.max}px)`
        }

        return viewport.applications.forEach(application => {
          query.append(this.renderApplication(application, viewport.bounds.min, fontSize, columns))
        })
      }

      let rule = CSSUtils.createRule(':root')

      if (!!viewport.fontSize) {
        rule.append(CSSUtils.createDecl('font-size', `${fontSize}px`))
        fontSize = viewport.fontSize ?? fontSize
      }

      rule.append(CSSUtils.createDecl('line-height', `${TypographyUtils.getOptimalLineHeight(fontSize, viewport.bounds.min, columns)}`))
      query.append(rule)

      this.#headingSelectors.forEach(selector => {
        query.append(this.renderHeading(selector, false, true, viewport.bounds.min))
      })

      ;[...this.applications.unbounded, ...viewport.applications].forEach(application => {
        query.append(this.renderApplication(application, viewport.bounds.min, fontSize, columns))
      })

      root.append(query)
    })

    return root
  }

  #registerApplication = (application, min = null, max = null) => {
    let indexes = {
      min: min ? this.#viewports.findIndex(viewport => viewport.name === min.name) : 0,
      max: max ? this.#viewports.findIndex(viewport => viewport.name === max.name) : this.#viewports.length - 1
    }

    if (!application.bounds.min) {
      this.#initialApplications.push(application)
    }

    this.#viewports.slice(indexes.min, indexes.max + 1).forEach((viewport, i) => {
      viewport.applications.push(application)
    })
  }
}
