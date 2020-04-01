import Config from '../../data/Config.js'
import Constants from '../../data/Constants.js'

import CSSUtils from '../../utilities/CSSUtils.js'
import TypographyUtils from '../../utilities/TypographyUtils.js'

function getHeadings (fontSize, width, dynamic = false) {
  let { headings } = Config.typography
  let root = CSSUtils.createRoot([])

  for (let n = 1; n <= 6; n++) {
    root.append(`
      h${n} {
        font-size: ${TypographyUtils.getFontSizeFormula(fontSize, width, headings[n], dynamic)};
        line-height: ${TypographyUtils.getLineHeightFormula(fontSize, width, headings[n], dynamic)}
      }
    `)
  }

  root.append(`
    legend {
      font-size: ${TypographyUtils.getFontSizeFormula(fontSize, width, headings.legend, dynamic)};
      line-height: ${TypographyUtils.getFontSizeFormula(fontSize, width, headings.legend, dynamic)};
    }
  `)

  return root
}

function processRanges (root, cb) {
  let { layout, typography, viewport } = Config
  let { smoothScaling } = typography

  let filteredRanges = viewport.ranges.filter(range => {
    if (!!range.fontSize) {
      if (!range.width.min) {
        return cb([
          `Invalid viewport range "${range.name}"`,
          `Ranges with a declared font size must have a minimum width`
        ])
      }

      return true
    }

    return false
  })

  filteredRanges.forEach((range, index) => {
    let { fontSize, width, height } = range

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
          font-size: ${TypographyUtils.getFontSizeFormula(fontSize, width, 0, smoothScaling)};
          line-height: ${TypographyUtils.getLineHeightFormula(fontSize, width, 0, smoothScaling)}
        }

        ${getHeadings(fontSize, width, smoothScaling).toString()}
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
      line-height: ${TypographyUtils.getLineHeight(fontSize.min, width.min)};
    }

    ${getHeadings(fontSize, width).toString()}
  `)
}

function addFirstRangeTypeset (root, cb) {
  let { layout, typography, smoothScaling } = Config
  let { ranges } = Config.viewport
  let firstRange = ranges.find(range => range.fontSize)

  let { height } = firstRange

  let fontSize = {
    min: typography.fontSize.min,
    max: firstRange.fontSize
  }

  let width = {
    min: layout.width.min,
    max: firstRange.width.min
  }

  root.append(`
    @media screen and (min-width: ${width.min}px)${height.min ? ` and (min-height: ${height.min}px)` : ''}${height.max ? ` and (max-height: ${height.max}px)` : ''} {
      :root {
        font-size: ${TypographyUtils.getFontSizeFormula(fontSize, width, 0, smoothScaling)};
        line-height: ${TypographyUtils.getLineHeightFormula(fontSize, width, 0, smoothScaling)}
      }

      ${getHeadings(fontSize, width, smoothScaling).toString()}
    }
  `)
}

function addLastRangeTypeset (root, cb) {
  let { fontSize } = Config.typography
  let { width } = Config.layout

  root.append(`
    @media screen and (min-width: ${width.max}px) {
      :root {
        font-size: ${fontSize.max}px;
        line-height: ${TypographyUtils.getLineHeight(fontSize.max, width.max)};
      }

      ${getHeadings(fontSize, width).toString()}
    }
  `)
}

export default function generateTypographyRules (cb) {
  let root = CSSUtils.createRoot([])

  addInitialTypeset(root, cb)

  addFirstRangeTypeset(root, cb)

  processRanges(root, cb)

  addLastRangeTypeset(root, cb)

  // let filteredRanges = widthRanges.filter(range => {
  //   return !!range.fontSize && NGN.coalesce(range.min, 0) <= width.max
  // })
  //
  // filteredRanges.forEach((range, index) => {
  //   let error = `Invalid viewport range "${range.name}"`
  //
  //   if (range.fontSize < fontSize.min) {
  //     return cb([
  //       error,
  //       `Specified font size (${range.fontSize}) is smaller than the minimum font size (${fontSize.min})`
  //     ])
  //   }
  //
  //   if (range.fontSize > fontSize.max) {
  //     return cb([
  //       `Invalid viewport range "${range.name}"`,
  //       `Specified font size (${range.fontSize}) is larger than the maximum font size (${fontSize.max})`
  //     ])
  //   }
  //
  //   let query = CSSUtils.createAtRule({
  //     name: 'media',
  //     params: `screen${range.min ? ` and (min-width: ${range.min}px)` : ''}${(range.max && index < filteredRanges.length - 1) ? ` and (max-width: ${range.max - 1}px)` : ''}`,
  //     nodes: [CSSUtils.createRule(':root')]
  //   })
  //
  //   let previous = NGN.coalesce(filteredRanges[index - 1])
  //
  //   if (index > 0 && !(previous && previous.fontSize === range.fontSize)) {
  //     query.nodes[0].append(`font-size: ${range.fontSize}px;`)
  //   }
  //
  //   query.nodes[0].append(`line-height: ${TypographyUtils.getLineHeight(range.fontSize, Math.max(range.min, width.min))}`)
  //   query.nodes.push(...getHeadings(range.fontSize, Math.max(range.min, width.min), false).nodes)
  //
  //   typesetRules.forEach(rule => {
  //     if (rule.query) {
  //       return
  //     }
  //
  //     let newRule = CSSUtils.createRule(rule.selector, [{
  //       prop: 'line-height',
  //       value: TypographyUtils.getLineHeight(rule.fontSize, Math.max(range.min, width.min))
  //     }])
  //
  //     console.log(newRule.toString());
  //
  //     query.nodes.push(newRule)
  //   })
  //
  //   root.append(query)
  //
  //   if (!smoothScaling) {
  //     return
  //   }
  //
  //   let next = NGN.coalesce(filteredRanges[index + 1], {
  //     fontSize: fontSize.max,
  //     min: width.max
  //   })
  //
  //   if (!next) {
  //     return
  //   }
  //
  //   let diff = next.fontSize - range.fontSize
  //   let fontSizeIncrement = 1
  //
  //   if (diff <= fontSizeIncrement) {
  //     return
  //   }
  //
  //   let { fontSize } = range
  //   let widthIncrement = ((next.min - range.min) / (next.fontSize - fontSize)) * fontSizeIncrement
  //
  //   for (let w = range.min + widthIncrement; w < next.min; w += widthIncrement) {
  //     fontSize += fontSizeIncrement
  //     w = Math.round(w)
  //
  //     root.append(`
  //       @media screen and (min-width: ${w}px) {
  //         :root {
  //           font-size: ${fontSize}px;
  //           line-height: ${TypographyUtils.getLineHeight(fontSize, w)};
  //         }
  //
  //         ${getHeadings(fontSize, w, false).toString()}
  //       }
  //     `)
  //   }
  // })
  //
  // root.append(`
  //   @media screen and (min-width: ${width.max}px) {
  //     :root {
  //       font-size: ${fontSize.max}px;
  //       line-height: ${TypographyUtils.getLineHeight(fontSize.max, width.max)};
  //     }
  //
  //     ${getHeadings(fontSize.max, width.max, false).toString()}
  //   }
  // `)

  return root.toString()
}
