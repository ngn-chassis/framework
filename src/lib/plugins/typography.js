import postcss from 'postcss'
import parser from 'postcss-scss'

import { CONFIG } from '../../index.js'

import SetRule from '../atrules/set/SetRule.js'
import Setting from '../atrules/set/Setting.js'

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

    root.walkAtRules('set', atrule => typography.addSetting(new SetRule(atrule)))
    rules.walkAtRules('set', atrule => typography.addSetting(new SetRule(atrule)))

    rules.append(typography.renderInitialSettings())
    rules.append(typography.renderViewports())

    annotations.typography.replaceWith(parser.parse(rules, { from: 'chassis.typography' }))
    resolve(root)
  })
})

class TypographyEngine {
  #settings = []
  #initialSettings = []
  #orphanSettings = []
  #theme
  #viewports
  #headingSelectors = [...[...Array(7).keys()].slice(1).map(n => `h${n}`), 'legend']

  constructor (theme, viewports) {
    this.#theme = theme
    this.#viewports = viewports
  }

  get settings () {
    return {
      unbounded: this.#settings,
      orphaned: this.#orphanSettings,
      initial: this.#initialSettings
    }
  }

  get viewports () {
    return this.#viewports
  }

  addSetting (setRule) {
    let setting = new Setting(setRule)
    setRule.remove()

    if (!setting.bounds) {
      return this.#settings.push(setting)
    }

    let viewports = {
      min: setting.bounds.min ? CONFIG.viewports.find(viewport => viewport.bounds.min >= setting.bounds.min) : null,
      max: setting.bounds.max ? CONFIG.viewports.find(viewport => viewport.bounds.max >= setting.bounds.max) : null
    }

    let buffer = [0,0]

    if (viewports.min && viewports.min.bounds.max < setting.bounds.min) {
      buffer[0] = setting.bounds.min - viewports.min.bounds.min
    }

    if (viewports.max && viewports.max.bounds.max > setting.bounds.max) {
      buffer[1] = setting.bounds.max - viewports.max.bounds.max
    }

    if (!viewports.min || !viewports.max) {
      let viewport = viewports.min ?? viewports.max

      switch (viewport) {
        case viewports.min: return this.#registerSetting(setting, viewports.min)
        case viewports.max: return this.#registerSetting(setting, null, viewports.max)
      }
    }

    if (viewports.min.name === viewports.max.name) {
      let viewport = this.#viewports.find(viewport => viewport.name === viewports.min.name)
      return viewport.settings.push(setting)
    }

    console.log(`IN BETWEEN - render at viewports falling completely within the bounds of the setting, and add additional queries for buffer`)
    this.#orphanSettings.push(setting)
  }

  renderSetting (setting, width = CONFIG.layout.width.min, fontSize = CONFIG.typography.baseFontSize, columns = 1) {
    if (setting.typeset) {
      fontSize = TypographyUtils.getFontSize(CONFIG.typography.baseFontSize, setting.typeset.size)
    }

    let lineHeight = TypographyUtils.getOptimalLineHeight(fontSize, width, columns)

    let cfg = {
      selector: setting.selector,
      decls: []
    }

    if (setting.typeset) {
      if (!setting.typeset.sizeSet) {
        cfg.fontSize = fontSize
        setting.typeset.sizeSet = true
      }

      cfg.lineHeight = lineHeight
    }

    if (setting.margin) {
      cfg.decls.push(...this.#getLayoutDecls('margin', setting.margin, fontSize, lineHeight, width, columns))
    }

    if (setting.padding) {
      cfg.decls.push(...this.#getLayoutDecls('padding', setting.padding, fontSize, lineHeight, width, columns))
    }

    let typeset = parser.parse(this.renderTypeset(cfg)).nodes[0]
    // typeset.source = setting.source

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

  renderInitialSettings () {
    let root = CSSUtils.createRoot()
    let { unbounded, initial } = this.settings

    ;[...unbounded, ...initial].forEach(setting => {
      root.append(this.renderSetting(setting))
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

        return viewport.settings.forEach(setting => {
          query.append(this.renderSetting(setting, viewport.bounds.min, fontSize, columns))
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

      ;[...this.settings.unbounded, ...viewport.settings].forEach(setting => {
        query.append(this.renderSetting(setting, viewport.bounds.min, fontSize, columns))
      })

      root.append(query)
    })

    return root
  }

  #registerSetting = (setting, min = null, max = null) => {
    let indexes = {
      min: min ? this.#viewports.findIndex(viewport => viewport.name === min.name) : 0,
      max: max ? this.#viewports.findIndex(viewport => viewport.name === max.name) : this.#viewports.length - 1
    }

    if (!setting.bounds.min) {
      this.#initialSettings.push(setting)
    }

    this.#viewports.slice(indexes.min, indexes.max + 1).forEach((viewport, i) => {
      viewport.settings.push(setting)
    })
  }
}
