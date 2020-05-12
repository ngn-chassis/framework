import Config from '../../data/Config.js'

import CSSUtils from '../../utilities/CSSUtils.js'
import QueueUtils from '../../utilities/QueueUtils.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'
import TypographyUtils from '../../utilities/TypographyUtils.js'
import UnitUtils from '../../utilities/UnitUtils.js'

export default class TypographyEngine {
  typesetRules = null

  static initialize (typesetRules, cb) {
    this.typesetRules = typesetRules
    let root = CSSUtils.createRoot()

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
          name: `Generating Initial Typeset`,
          callback: next => this.#generateInitialTypeset((err, css) => callback(err, css, next))
        },

        {
          name: `Generating Viewport Width Range Typesets`,
          callback: next => this.#generateRanges((err, css) => callback(err, css, next))
        },

        {
          name: `Generating Last Viewport Width Range Typeset`,
          callback: next => this.#generateLastRangeTypeset((err, css) => callback(err, css, next))
        }
      ]
    })
    .then(() => {
      // TEMPORARY
      root.append(`
        section, p {
          margin-bottom: 1em;
        }
      `)

      cb(null, root)
    })
    .catch(cb)
  }

  static generateTypeset ({ selector, increment, width, columns, includeFontSize, decls }) {
    let { fontSize } = Config.typography
    let adjustedFontSize = TypographyUtils.getFontSize(fontSize.min, increment)
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

  static getTypesetSelector (atrule, cb) {
    let { parent } = atrule

    if (!parent || parent.type === 'root' ) {
      return cb(atrule.error(`\n@typeset rule cannot be used at the root level`))
    }

    let chain = SelectorUtils.getLineage(parent)

    SelectorUtils.resolve(chain, (err, result) => {
      if (err) {
        return cb(err)
      }

      cb(null, result)
    })
  }

  static #generateInitialTypeset = cb => {
    let { fontSize, scaleRatio } = Config.typography
    let { width } = Config.layout
    let { ranges } = Config.viewport

    let typesets = CSSUtils.createRoot()

    QueueUtils.run({
      log: false,

      tasks: this.typesetRules.map(atrule => ({
        name: 'Resolve Typeset',
        callback: next => {
          this.getTypesetSelector(atrule, (err, selector) => {
            console.log(selector);
            if (err) {
              return cb(err)
            }

            typesets.append(this.generateTypeset({
              selector,
              increment: atrule.increment,
              width: width.min,
              includeFontSize: true
            }))

            next()
          })
        }
      }))
    }).then(() => cb(null, `
      /* Root ************************************************************************/

      :root {
        background: var(--root-bg-color, initial);
        font-size: ${fontSize.min}px;
        line-height: ${TypographyUtils.getOptimalLineHeight(fontSize.min, width.min)};
      }

      body {
        min-width: ${width.min}px;
        font-family: var(--font-family, initial);
        color: var(--text-color, initial);
      }

      /* Typography ******************************************************************/

      ${this.#generateHeadings(fontSize.min, width.min).toString()}

      ${typesets.toString()}
    `)).catch(cb)
  }

  static #generateRanges = cb => {
    let { layout, typography, viewport } = Config
    // let { smoothScaling } = typography

    let filteredRanges = viewport.ranges.filter(range => {
      if (!range.fontSize) {
        return false
      }

      if (!range.width.min) {
        return cb(new Error(`\nInvalid viewport range "${range.name}"\nRanges with a declared font size must have a minimum width`))
      }

      return true
    })

    let root = CSSUtils.createRoot()

    QueueUtils.run({
      log: false,

      tasks: filteredRanges.map((range, index) => ({
        name: 'Resolving Viewport Range Typography',
        callback: next => {
          let { fontSize, width, height, columns } = range
          let maxWidth = width.max
          let nextRange = NGN.coalesce(filteredRanges[index + 1])

          if (!maxWidth) {
            maxWidth = nextRange ? NGN.coalesce(width.max, nextRange.width.min) : layout.width.max
          }

          width = {
            min: range.width.min,
            max: maxWidth
          }

          let typesets = CSSUtils.createRoot()

          QueueUtils.run({
            log: false,

            tasks: this.typesetRules.map(atrule => ({
              name: 'Resolve Typeset',
              callback: next => {
                this.getTypesetSelector(atrule, (err, selector) => {
                  if (err) {
                    return cb(err)
                  }

                  typesets.append(this.generateTypeset({
                    selector,
                    increment: atrule.increment,
                    width: width.min,
                    includeFontSize: false,
                    columns
                  }))

                  next()
                })
              }
            }))
          }).then(() => {
            root.append(`
              @media screen and (min-width: ${width.min}px) and (max-width: ${width.max - 1}px)${height.min ? ` and (min-height: ${height.min}px)` : ''}${height.max ? ` and (max-height: ${height.max}px)` : ''} {
                :root {
                  font-size: ${fontSize}px;
                  line-height: ${TypographyUtils.getOptimalLineHeight(fontSize, width.min, columns)};
                }

                ${this.#generateHeadings(fontSize, width.min, columns, false).toString()}

                ${typesets.toString()}
              }
            `)

            next()
          }).catch(cb)
        }
      }))
    })
    .then(() => cb(null, root))
    .catch(cb)
  }

  static #generateLastRangeTypeset = cb => {
    let range = Config.viewport.ranges[Config.viewport.ranges.length - 1]
    let { fontSize } = Config.typography
    let { width } = Config.layout
    let root = CSSUtils.createRoot()

    let typesets = CSSUtils.createRoot()

    QueueUtils.run({
      log: false,

      tasks: this.typesetRules.map(atrule => ({
        name: 'Resolve Typeset',
        callback: next => {
          this.getTypesetSelector(atrule, (err, selector) => {
            if (err) {
              return cb(err)
            }

            typesets.append(this.generateTypeset({
              selector,
              increment: atrule.increment,
              width: width.max,
              columns: range.columns,
              includeFontSize: true
            }))

            next()
          })
        }
      }))
    }).then(() => {
      root.append(`
        @media screen and (min-width: ${width.max}px) {
          :root {
            font-size: ${fontSize.max}px;
            line-height: ${TypographyUtils.getOptimalLineHeight(fontSize.max, width.max, range.columns)};
          }

          ${this.#generateHeadings(fontSize.max, width.max, range.columns, false).toString()}

          ${typesets.toString()}
        }
      `)

      cb(null, root)
    }).catch(cb)
  }

  static #generateHeadings = (fontSize, width, columns = 1, includeFontSize = true) => {
    let { headings } = Config.typography
    let root = CSSUtils.createRoot([])

    for (let n = 1; n <= 6; n++) {
      root.append(this.generateTypeset({
        selector: `h${n}`,
        increment: headings[n],
        width,
        columns,
        includeFontSize,
        decls: CSSUtils.createDecl('margin-bottom', '1em')
      }))
    }

    root.append(this.generateTypeset({
      selector: 'legend',
      increment: headings.legend,
      width,
      columns,
      decls: CSSUtils.createDecl('margin-bottom', '1em')
    }))

    return root
  }
}
