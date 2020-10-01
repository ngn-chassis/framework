import parser from 'postcss-scss'

import SetRule from './atrules/set/SetRule.js'
import Setting from './atrules/set/Setting.js'

import CSSUtils from './utilities/CSSUtils.js'
import LayoutUtils from './utilities/LayoutUtils.js'
import TypographyUtils from './utilities/TypographyUtils.js'
import UnitUtils from './utilities/UnitUtils.js'

import { CONFIG } from '../index.js'

export default class TypographyEngine {
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
    const setting = new Setting(setRule)
    setRule.remove()

    if (!setting.bounds) {
      return this.#settings.push(setting)
    }

    const viewports = {
      min: setting.bounds.min ? CONFIG.viewports.find(viewport => viewport.bounds.min >= setting.bounds.min) : null,
      max: setting.bounds.max ? CONFIG.viewports.find(viewport => viewport.bounds.max >= setting.bounds.max) : null
    }

    const buffer = [0, 0]

    if (viewports.min && viewports.min.bounds.max < setting.bounds.min) {
      buffer[0] = setting.bounds.min - viewports.min.bounds.min
    }

    if (viewports.max && viewports.max.bounds.max > setting.bounds.max) {
      buffer[1] = setting.bounds.max - viewports.max.bounds.max
    }

    if (!viewports.min || !viewports.max) {
      const viewport = viewports.min ?? viewports.max

      switch (viewport) {
        case viewports.min: return this.#registerSetting(setting, viewports.min)
        case viewports.max: return this.#registerSetting(setting, null, viewports.max)
      }
    }

    if (viewports.min.name === viewports.max.name) {
      const viewport = this.#viewports.find(viewport => viewport.name === viewports.min.name)
      return viewport.settings.push(setting)
    }

    console.log('IN BETWEEN - render at viewports falling completely within the bounds of the setting, and add additional queries for buffer')
    this.#orphanSettings.push(setting)
  }

  processInlineComponentSettings (atrule) {
    let settings = []

    atrule.nodes.forEach(node => {
      if (node.type !== 'atrule') {
        return
      }

      switch (node.name) {
        case 'set':
          settings.push(new Setting(new SetRule(node)))
          return node.remove()

        case 'state': return this.processInlineComponentSettings(node)
        default: return
      }

    })

    if (settings.length > 0) {
      atrule.parent.insertAfter(atrule, this.renderViewports(CSSUtils.createRoot(), false, false, settings).nodes)
    }

    atrule.replaceWith(atrule.nodes)
  }

  renderSetting (setting, width = CONFIG.layout.width.min, fontSize = CONFIG.typography.baseFontSize, columns = 1, includeSelector = true) {
    if (setting.typeset) {
      fontSize = TypographyUtils.getFontSize(CONFIG.typography.baseFontSize, setting.typeset.size)
    }

    const lineHeight = TypographyUtils.getOptimalLineHeight(fontSize, width, columns)

    const cfg = {
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

    const typeset = parser.parse(this.renderTypeset(cfg))
    // typeset.source = setting.source

    // if (typeset.nodes.length === 0) {
    //   return null
    // }

    return typeset
  }

  renderInitialSettings () {
    const root = CSSUtils.createRoot()
    const { unbounded, initial } = this.settings

    ;[...unbounded, ...initial].forEach(setting => {
      root.append(this.renderSetting(setting))
    })

    return root
  }

  renderInitialHeadings () {
    const root = CSSUtils.createRoot()

    this.#headingSelectors.forEach(selector => {
      root.append(this.renderHeading(selector, true, true, CONFIG.layout.width.min, this.#theme.getHeading(selector)))
    })

    return root
  }

  renderHeading (selector, includeFontSize, includeLineHeight, width, decls = []) {
    const rule = CSSUtils.createRule(selector)
    const fontSize = TypographyUtils.getFontSize(CONFIG.typography.baseFontSize, CONFIG.typography.headings[selector])

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
    const rule = CSSUtils.createRule(selector)

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

  renderViewports (root, addHeadings = true, includeRoot = true, settings) {
    let fontSize = CONFIG.typography.baseFontSize

    this.#viewports.forEach((viewport, i) => {
      if (!viewport.bounds.min) {
        return
      }

      const query = CSSUtils.createAtRule({
        name: 'media',
        params: `screen and (min-width: ${viewport.bounds.min}px)`
      })

      const columns = viewport.columns ?? 1

      if (viewport.type !== 'range') {
        if (viewport.bounds.max !== CONFIG.layout.width.max) {
          query.params += ` and (max-width: ${viewport.bounds.max}px)`
        }

        return viewport.settings.forEach(setting => {
          query.append(this.renderSetting(setting, viewport.bounds.min, fontSize, columns))
        })
      }

      root.append(CSSUtils.createComment(`${viewport.name}`))

      if (includeRoot) {
        const rule = CSSUtils.createRule(':root')

        if (viewport.fontSize) {
          fontSize = viewport.fontSize
          rule.append(CSSUtils.createDecl('font-size', `${fontSize}px`))
        }

        rule.append(CSSUtils.createDecl('line-height', `${TypographyUtils.getOptimalLineHeight(fontSize, viewport.bounds.min, columns)}`))
        query.append(rule)
      }

      if (addHeadings) {
        this.#headingSelectors.forEach(selector => {
          query.append(this.renderHeading(selector, false, true, viewport.bounds.min))
        })
      }

      (settings ?? [...this.settings.unbounded, ...viewport.settings]).forEach(setting => {
        setting = this.renderSetting(setting, viewport.bounds.min, fontSize, columns)
        query.append(settings ? setting.nodes[0].nodes : setting.nodes[0])
      })

      root.append(query)
    })

    return root
  }

  #getLayoutDecls = (type, cfg, fontSize, lineHeight, width, columns) => {
    if (cfg.typeset !== 0) {
      fontSize = TypographyUtils.getFontSize(CONFIG.typography.baseFontSize, cfg.typeset)
      lineHeight = TypographyUtils.getOptimalLineHeight(fontSize, width, columns)
    }

    const process = (...args) => {
      switch (type) {
        case 'margin': return LayoutUtils.getMargin(...args)
        case 'padding': return LayoutUtils.getPadding(...args)
        // default: TODO: Throw Error
      }
    }

    const values = {
      top: cfg.top ? process(cfg.display, 'top', lineHeight, cfg.top) : null,
      right: cfg.right ? process(cfg.display, 'right', lineHeight, cfg.right) : null,
      bottom: cfg.bottom ? process(cfg.display, 'bottom', lineHeight, cfg.bottom) : null,
      left: cfg.left ? process(cfg.display, 'left', lineHeight, cfg.left) : null
    }

    const decls = []
    const dimensions = ['top', 'right', 'bottom', 'left']

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

  #registerSetting = (setting, min = null, max = null) => {
    const indexes = {
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
