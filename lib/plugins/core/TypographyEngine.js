// TODO: Handle Margin and Padding
// Handle Viewport Groups

import postcss from 'postcss'

import { CONFIG } from '../../../index.js'
import Typeset from '../../atrules/apply/Typeset.js'

import CSSUtils from '../../utilities/CSSUtils.js'
import QueueUtils from '../../utilities/QueueUtils.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'
import LayoutUtils from '../../utilities/LayoutUtils.js'
import TypographyUtils from '../../utilities/TypographyUtils.js'
import UnitUtils from '../../utilities/UnitUtils.js'
import ViewportUtils from '../../utilities/ViewportUtils.js'

export default class TypographyEngine {
  static #applications = []
  static #headings = null
  static #root = CSSUtils.createRoot()
  static #initialApplications = []
  static #orphanApplications = []
  static #viewports = null

  static initialize (theme, applications, cb) {
    this.#viewports = CONFIG.viewports
    this.#headings = this.#generateHeadingTypesets(theme, applications)

    let callback = (err, css, next) => {
      if (err) {
        return cb(err)
      }

      this.#root.append(css)
      next()
    }

    QueueUtils.run({
      log: false,

      tasks: [{
        name: 'Generating Application Media Queries',
        callback: next => {
          this.#registerApplications(applications)
          next()
        }
      }, {
        name: `Generating Initial Typography`,
        callback: next => this.#renderInitial((err, css) => callback(err, css, next))
      }, {
        name: `Generating Viewport Typesets`,
        callback: next => this.#renderViewports((err, css) => callback(err, css, next))
      }]
    })
    .then(() => {
      // TEMPORARY
      // this.#root.append(`
      //   p:not(:first-of-type) {
      //     margin-top: 1em;
      //   }
      // `)

      cb(null, this.#root)
    })
    .catch(cb)
  }

  static generateTypeset ({ selector, fontSize, lineHeight, decls }) {
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

  static #generateHeadingTypeset = (selector, size, theme, applications) => {
    let heading = theme.headings.find(heading => heading.name === selector)
    let index = null
    let application = applications.find((application, i) => {
      if (application.selector === selector) {
        index = i
        return true
      }

      return false
    })
    let decls = []

    if (application) {
      if (application.typeset) {
        size = application.typeset.size
      }

      console.log('HANDLE MARGIN/PADDING')
      applications = applications.splice(index, 1)
    }

    if (heading) {
      decls.push(...heading.nodes)
    }

    return {
      selector,
      size,
      bounds: null,
      decls
    }
  }

  static #generateHeadingTypesets = (theme, applications) => {
    let headings = []

    for (let n = 1; n <= 6; n++) {
      headings.push(this.#generateHeadingTypeset(`h${n}`, CONFIG.typography.headings[n], theme, applications))
    }

    headings.push(this.#generateHeadingTypeset('legend', CONFIG.typography.headings['legend'], theme, applications))
    return headings
  }

  static #getLayoutDecls = (type, cfg, lineHeight) => {
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

  static #registerApplication = (application, min = null, max = null) => {
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

  static #registerApplications = applications => {
    let root = CSSUtils.createRoot()

    applications.forEach(application => {
      if (!application.bounds) {
        return this.#applications.push(application)
      }

      let viewports = {
        min: application.bounds.min ? CONFIG.viewports.find(viewport => viewport.bounds.min >= application.bounds.min) : null,
        max: application.bounds.max ? CONFIG.viewports.find(viewport => viewport.bounds.max >= application.bounds.max) : null
      }

      let buffer = [0,0]
      let { min, max } = viewports

      if (min && min.bounds.max < application.bounds.min) {
        buffer[0] = application.bounds.min - min.bounds.min
      }

      if (max && max.bounds.max > application.bounds.max) {
        buffer[1] = application.bounds.max - max.bounds.max
      }

      if (!min || !max) {
        let viewport = NGN.coalesce(min, max)

        switch (viewport) {
          case min: return this.#registerApplication(application, min)
          case max: return this.#registerApplication(application, null, max)
        }
      }

      if (min.name === max.name) {
        let viewport = this.#viewports.find(viewport => viewport.name === min.name)
        return viewport.applications.push(application)
      }

      console.log(`IN BETWEEN - render at viewports falling completely within the bounds of the application, and add additional queries for buffer`)
      this.#orphanApplications.push(application)
    })
  }

  static #renderApplication = (root, application, width, size, columns) => {
    let fontSize = application.typeset ? TypographyUtils.getFontSize(CONFIG.typography.baseFontSize, application.typeset.size) : size
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
      cfg.decls.push(...this.#getLayoutDecls('margin', application.margin, lineHeight))
    }

    if (application.padding) {
      cfg.decls.push(...this.#getLayoutDecls('padding', application.padding, lineHeight))
    }

    let typeset = postcss.parse(this.generateTypeset(cfg)).nodes[0]

    // typeset.source = application.source
    // application.root.remove()

    if (typeset.nodes.length === 0) {
      return
    }

    root.append(typeset)
  }

  static #renderInitial = cb => {
    let { baseFontSize, scaleRatio } = CONFIG.typography
    let { width } = CONFIG.layout
    let root = CSSUtils.createRoot()

    root.append(`
      /* Root ************************************************************************/

      :root {
        background: var(--root-bg-color, initial);
        font-size: ${baseFontSize}px;
        line-height: ${TypographyUtils.getOptimalLineHeight(baseFontSize, width.min)};
      }

      body {
        min-width: ${width.min}px;
        font-family: var(--font-family, initial);
        color: var(--text-color, initial);
      }

      /* Typography ******************************************************************/
    `)

    this.#headings.forEach(heading => {
      let fontSize = TypographyUtils.getFontSize(baseFontSize, heading.size)

      root.append(this.generateTypeset({
        selector: heading.selector,
        fontSize,
        lineHeight: TypographyUtils.getOptimalLineHeight(fontSize, width.min),
        decls: heading.decls
      }))
    })

    let firstRange = CONFIG.viewports.find(vp => vp.type === 'range')

    ;[...this.#applications, ...this.#initialApplications].forEach(application => {
      this.#renderApplication(root, application, width.min, baseFontSize, 1)
    })

    cb(null, root)
  }

  // static #renderViewportGroup = (viewport, target, cfg, cb) => {
  //   let { sizes } = this.#getVariations(viewport.typesets.map(typeset => ({
  //     selector: typeset.selector,
  //     size: typeset.size,
  //     fontSizeSet: typeset.fontSizeSet
  //   })))
  //
  //   this.#renderVariations(sizes, target, cfg)
  //   cb(null, target)
  // }

  static #renderViewports = (cb) => {
    let root = CSSUtils.createRoot()
    let ranges = this.#viewports.filter(viewport => viewport.type === 'range')
    let fontSize = CONFIG.typography.baseFontSize

    this.#viewports.forEach((viewport, i) => {
      let query = CSSUtils.createAtRule({
        name: 'media',
        params: `screen and (min-width: ${viewport.bounds.min}px)`
      })

      if (viewport.type !== 'range') {
        return console.log('HANDLE GROUP')
      }

      if (!viewport.bounds.min) {
        return
      }

      root.append(`/* ${viewport.name} */`)

      let columns = viewport.columns || 1
      let rule = CSSUtils.createRule(':root')

      if (!!viewport.fontSize) {
        rule.append(CSSUtils.createDecl('font-size', `${fontSize}px`))
        fontSize = viewport.fontSize || fontSize
      }

      rule.append(CSSUtils.createDecl('line-height', `${TypographyUtils.getOptimalLineHeight(fontSize, viewport.bounds.min, columns)}`))
      query.append(rule)

      this.#headings.forEach(heading => {
        let headingFontSize = TypographyUtils.getFontSize(fontSize, heading.size)

        query.append(this.generateTypeset({
          selector: heading.selector,
          lineHeight: TypographyUtils.getOptimalLineHeight(headingFontSize, viewport.bounds.min, columns),
          decls: heading.decls
        }))
      })

      ;[...this.#applications, ...viewport.applications].forEach(application => {
        this.#renderApplication(query, application, viewport.bounds.min, fontSize, columns)
      })

      root.append(query)
    })

    cb(null, root)
  }
}
