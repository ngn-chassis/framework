import Config from '../data/Config.js'
import CSSUtils from './CSSUtils.js'
import UnitUtils from './UnitUtils.js'

export default class TypographyUtils {
  // static getLineHeight (fontSize, viewportWidth, ratio = Config.typography.scaleRatio) {
  //   return this.getLineHeightPx(...arguments) / fontSize
	// }
  //
  // static getLineHeightFormula (fontSize = Config.typography.fontSize, width = Config.layout.width, modifier = 0, dynamic = false) {
  //   return UnitUtils.pxToRelative(this.getLineHeightPx(fontSize.min, width.min), this.getFontSize(modifier, fontSize.min))
  // }
  //
  // static getLineHeightPx (fontSize, viewportWidth, ratio = Config.typography.scaleRatio) {
  //   let minLineHeight = 1 + (ratio - 1 / ratio)
  //   let widthFactor = (viewportWidth > 1024 ? viewportWidth * minSegment : viewportWidth) / this.getOptimalLineWidth(fontSize)
  //
  //   return Math.max(minLineHeight, fontSize * (minLineHeight + (minSegment * widthFactor)));
	// }

  static get minSegment () {
    let { scaleRatio } = Config.typography
    return (scaleRatio - 1) / scaleRatio
  }

  static get minLineHeight () {
    return 1 + this.minSegment
  }

  static getWidthBasedLineHeight (fontSize, viewportWidth, orientation = 'landscape', ratio = Config.typography.scaleRatio) {
    let base = viewportWidth

    if (base >= 1024 && orientation === 'landscape') {
      base = viewportWidth / 2
    }

    let widthFactor = base / this.getOptimalLineWidth(fontSize)

    return Math.max(this.minLineHeight, (fontSize * (this.minLineHeight + (this.minSegment * widthFactor))) / fontSize)
  }

  static getProportionalLineHeight (increment, ratio = Config.typography.scaleRatio) {
    let lineHeight = {
      min: this.minLineHeight,
      max: ratio
    }

    let fontSize = this.getFontSize(increment) / Config.typography.fontSize.min
    let lineHeightDiff = lineHeight.max - lineHeight.min

    return lineHeight.min + (lineHeightDiff / fontSize)
  }

  static getFontSize (increment = 0, fontSize = Config.typography.fontSize.min) {
    let { scaleRatio } = Config.typography

    if (increment === 0) {
      return fontSize
    }

    if (increment < 0) {
      return fontSize / Math.pow(scaleRatio, Math.abs(increment) / 2)
    }

    return fontSize * Math.pow(scaleRatio, increment / 2)
  }

  static getFontSizeRems (fontSize = Config.typography.fontSize, modifier = 0) {
    return `${UnitUtils.pxToRelative(this.getFontSize(modifier, fontSize))}rem`
  }

  static getOptimalLineWidth (fontSize, ratio = Config.typography.scaleRatio) {
    let { cpl, charConstant } = Config.typography

    return fontSize * (cpl / charConstant)
	}

  static generateInitialTypeset (cb) {
    let { fontSize, scaleRatio } = Config.typography
    let { width } = Config.layout
    let { ranges } = Config.viewport

    cb(null, `
      /* Root ************************************************************************/

      :root {
        background: var(--root-bg-color, initial);
        font-size: ${fontSize.min}px;
        line-height: ${this.getWidthBasedLineHeight(fontSize.min, width.min)};
      }

      body {
        min-width: ${width.min}px;
        font-family: var(--font-family, initial);
        color: var(--text-color, initial);
      }

      /* Typography ******************************************************************/

      ${this.#getHeadings(fontSize).toString()}
    `)
  }

  static generateRanges (cb) {
    let { layout, typography, viewport } = Config
    let { smoothScaling } = typography
    let root = CSSUtils.createRoot()

    let filteredRanges = viewport.ranges.filter(range => {
      if (!range.fontSize) {
        return false
      }

      if (!range.width.min) {
        return cb(new Error(`\nInvalid viewport range "${range.name}"\nRanges with a declared font size must have a minimum width`))
      }

      return true
    })

    filteredRanges.forEach((range, index) => {
      let { fontSize, width, height, orientation } = range

      let maxWidth = width.max

      let next = NGN.coalesce(filteredRanges[index + 1])
      let nextFontSize = typography.fontSize.max
      let nextMinWidth = layout.width.max

      if (next) {
        nextFontSize = next.fontSize
        nextMinWidth = next.width.min
      }

      if (!maxWidth) {
        maxWidth = next ? NGN.coalesce(width.max, next.width.min) : layout.width.max
      }

      fontSize = {
        min: range.fontSize,
        max: nextFontSize
      }

      width = {
        min: range.width.min,
        max: maxWidth
      }

      root.append(`
        @media screen and (min-width: ${width.min}px) and (max-width: ${width.max - 1}px)${height.min ? ` and (min-height: ${height.min}px)` : ''}${height.max ? ` and (max-height: ${height.max}px)` : ''} {
          :root {
            font-size: ${fontSize.min}px;
            line-height: ${this.getWidthBasedLineHeight(fontSize.min, width.min, orientation)};
          }
        }
      `)
    })

    cb(null, root)
  }

  static generateLastRangeTypeset (cb) {
    let { fontSize } = Config.typography
    let { width } = Config.layout
    let root = CSSUtils.createRoot()

    root.append(`
      @media screen and (min-width: ${width.max}px) {
        :root {
          font-size: ${fontSize.max}px;
          line-height: ${this.getWidthBasedLineHeight(fontSize.max, width.max)};
        }
      }
    `)

    cb(null, root)
  }

  static #getHeadings = fontSize => {
    let { headings } = Config.typography
    let root = CSSUtils.createRoot([])

    for (let n = 1; n <= 6; n++) {
      root.append(`
        h${n} {
          font-size: ${this.getFontSizeRems(fontSize.min, headings[n])};
          line-height: ${this.getProportionalLineHeight(headings[n])};
          margin-bottom: 1em;
        }
      `)
    }

    root.append(`
      legend {
        font-size: ${this.getFontSizeRems(fontSize.min, headings.legend)};
        line-height: ${this.getProportionalLineHeight(headings.legend)};
        margin-bottom: 1em;
      }
    `)

    return root
  }
}
