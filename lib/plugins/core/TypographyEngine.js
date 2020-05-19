import Config from '../../data/Config.js'
import Typeset from '../../Typeset.js'

import CSSUtils from '../../utilities/CSSUtils.js'
import QueueUtils from '../../utilities/QueueUtils.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'
import TypographyUtils from '../../utilities/TypographyUtils.js'
import UnitUtils from '../../utilities/UnitUtils.js'
import ViewportUtils from '../../utilities/ViewportUtils.js'

export default class TypographyEngine {
  static initialize (typesets, cb) {
    let headings = this.#generateHeadingTypesets()
    let root = CSSUtils.createRoot()
    let increments = this.#getIncrements([...headings, ...typesets])

    let callback = (err, css, next) => {
      if (err) {
        return cb(err)
      }

      root.append(css)
      next()
    }

    QueueUtils.run({
      log: false,

      tasks: [
        {
          name: `Generating Initial Typography`,
          callback: next => this.#renderInitial(increments, (err, css) => callback(err, css, next))
        },

        {
          name: `Generating Viewport Typesets`,
          callback: next => this.#renderViewports(typesets, increments, (err, css) => callback(err, css, next))
        }
      ]
    })
    .then(() => {
      // TEMPORARY
      root.append(`
        p:not(:first-of-type) {
          margin-top: 1em;
        }
      `)

      cb(null, root)
    })
    .catch(cb)
  }

  static generateTypeset ({ selector, increment, width, columns, includeFontSize, decls }) {
    let adjustedFontSize = TypographyUtils.getFontSize(Config.typography.baseFontSize, increment)
    let rule = CSSUtils.createRule(selector)

    if (includeFontSize) {
      rule.append(`font-size: ${UnitUtils.pxToRelative(adjustedFontSize)}rem;`)
    }

    rule.append(`line-height: ${TypographyUtils.getOptimalLineHeight(adjustedFontSize, width, columns)}`)

    if (decls) {
      rule.append(decls)
    }

    return rule
  }

  static #generateHeadingTypesets = () => {
    let headings = []

    for (let n = 1; n <= 6; n++) {
      headings.push({
        selector: `h${n}`,
        increment: Config.typography.headings[n],
        bounds: null
      })
    }

    headings.push({
      selector: `legend`,
      increment: Config.typography.headings['legend'],
      bounds: null
    })

    return headings
  }

  static #getIncrements = typesets => {
    let increments = new Map()

    typesets.forEach(typeset => {
      let { increment } = typeset

      if (!increments.has(increment)) {
        increments.set(increment, [typeset])
      } else {
        increments.get(increment).push(typeset)
      }
    })

    return new Map([...increments.entries()].sort().reverse())
  }

  static #renderInitial = (increments, cb) => {
    let { baseFontSize, scaleRatio } = Config.typography
    let { width } = Config.layout
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

    for (let [increment, typesets] of increments) {
      root.append(this.generateTypeset({
        selector: typesets.map(typeset => typeset.selector).join(', '),
        increment,
        width: width.min,
        columns: 1,
        includeFontSize: true
      }))
    }

    cb(null, root)
  }

  static #renderViewports = (typesets, increments, cb) => {
    let root = CSSUtils.createRoot()
    let viewports = Config.viewports.filter(viewport => viewport.type === 'range' && !!viewport.bounds.min)
    let lastFontSize = Config.typography.baseFontSize

    viewports.forEach((viewport, index) => {
      let { bounds, columns, fontSize, typesets } = viewport
      let last = index === viewports.length - 1

      let query = CSSUtils.createAtRule({
        name: 'media',
        params: `screen and (min-width: ${bounds.min}px)${!last ? ` and (max-width: ${bounds.max}px)` : ''}`
      })

      root.append(`/* ${viewport.name} */`)
      let rule = CSSUtils.createRule(':root')

      if (!!viewport.fontSize) {
        rule.append(CSSUtils.createDecl('font-size', `${fontSize}px`))
      }

      rule.append(CSSUtils.createDecl('line-height', `${TypographyUtils.getOptimalLineHeight(fontSize || lastFontSize, bounds.min, columns)}`))

      query.append(rule)

      for (let [increment, typesets] of increments) {
        query.append(this.generateTypeset({
          selector: typesets.map(typeset => typeset.selector).join(', '),
          increment,
          width: bounds.min,
          columns,
          includeFontSize: false
        }))
      }

      if (typesets.length > 0) {
        typesets.forEach(typeset => {
          query.append(this.generateTypeset({
            selector: typeset.selector,
            increment: typeset.increment,
            width: bounds.min,
            columns,
            includeFontSize: true
          }))
        })
      }

      root.append(query)
      cb(null, root)
    })
  }
}
