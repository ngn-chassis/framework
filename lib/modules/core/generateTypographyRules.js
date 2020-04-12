import Config from '../../data/Config.js'
import Constants from '../../data/Constants.js'

import CSSUtils from '../../utilities/CSSUtils.js'
import TypographyUtils from '../../utilities/TypographyUtils.js'

function getHeadings (fontSize) {
  let { headings } = Config.typography
  let root = CSSUtils.createRoot([])

  for (let n = 1; n <= 6; n++) {
    root.append(`
      h${n} {
        font-size: ${TypographyUtils.getFontSizeRems(fontSize.min, headings[n])};
        line-height: ${TypographyUtils.getProportionalLineHeight(headings[n])};
        margin-bottom: 1em;
      }
    `)
  }

  root.append(`
    legend {
      font-size: ${TypographyUtils.getFontSizeRems(fontSize.min, headings.legend)};
      line-height: ${TypographyUtils.getProportionalLineHeight(headings.legend)};
      margin-bottom: 1em;
    }
  `)

  return root
}

function processRanges (root, cb) {
  let { layout, typography, viewport } = Config
  let { smoothScaling } = typography

  let filteredRanges = viewport.ranges.filter(range => {
    if (!range.fontSize) {
      return false
    }

    if (!range.width.min) {
      return cb([
        `Invalid viewport range "${range.name}"`,
        `Ranges with a declared font size must have a minimum width`
      ])
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
          line-height: ${TypographyUtils.getWidthBasedLineHeight(fontSize.min, width.min, orientation)};
        }
      }
    `)
  })
}

function addInitialTypeset (root, cb) {
  let { fontSize, scaleRatio } = Config.typography
  let { width } = Config.layout
  let { ranges } = Config.viewport

  root.append(`
    :root {
      font-size: ${fontSize.min}px;
      line-height: ${TypographyUtils.getWidthBasedLineHeight(fontSize.min, width.min)};
    }

    ${getHeadings(fontSize).toString()}
  `)
}

function addLastRangeTypeset (root, cb) {
  let { fontSize } = Config.typography
  let { width } = Config.layout

  root.append(`
    @media screen and (min-width: ${width.max}px) {
      :root {
        font-size: ${fontSize.max}px;
        line-height: ${TypographyUtils.getWidthBasedLineHeight(fontSize.max, width.max)};
      }
    }
  `)
}

export default function generateTypographyRules (cb) {
  let root = CSSUtils.createRoot([])

  addInitialTypeset(root, cb)

  processRanges(root, cb)

  addLastRangeTypeset(root, cb)

  return root.toString()
}
