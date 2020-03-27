import Config from '../../data/Config.js'
import Constants from '../../data/Constants.js'

import CSSUtils from '../../utilities/CSSUtils.js'
import TypographyUtils from '../../utilities/TypographyUtils.js'

function applyHeading (name, fontSize, width, includeFontSize = true, includeLineHeight = true) {
  let { headings, scaleRatio } = Config.typography
  let headingFontSize = TypographyUtils.getFontSize(fontSize, headings[name])
  let rule = CSSUtils.createRule(typeof name === 'number' ? `h${name}` : name)

  if (includeFontSize) {
    rule.append(`font-size: ${headingFontSize / fontSize}rem;`)
  }

  if (includeLineHeight) {
    rule.append(`line-height: ${TypographyUtils.calculateLineHeight(headingFontSize, width)};`)
  }

  if (includeFontSize) {
    rule.append(`margin-bottom: ${TypographyUtils.calculateLineHeight(headingFontSize, width) / scaleRatio}em;`)
  }

  return rule
}

function getHeadings (fontSize, width, includeFontSize = true, includeLineHeight = true) {
  let root = CSSUtils.createRoot([])

  for (let n = 1; n <= 6; n++) {
    root.append(applyHeading(n, ...arguments))
  }

  root.append(applyHeading('legend', ...arguments))
  return root
}

export default function generateConstraints () {
  let { autoScale, minFontSize, maxFontSize, scaleRatio } = Config.typography
  let { width } = Config.layout
  let { widthRanges } = Config.viewport

  let root = CSSUtils.createRoot([])

  root.append(`
    :root {
      font-size: ${minFontSize}px;
    }

    ${getHeadings(minFontSize, width.min, true, false).toString()}
  `)

  let filteredRanges = widthRanges.filter(range => {
    return !!range.fontSize && NGN.coalesce(range.bounds.min, 0) <= width.max
  })

  filteredRanges.forEach((range, index) => {
    let { bounds, fontSize } = range

    let query = CSSUtils.createAtRule({
      name: 'media',
      params: `screen${bounds.min ? ` and (min-width: ${bounds.min}px)` : ''}${(bounds.max && index < filteredRanges.length - 1) ? ` and (max-width: ${bounds.max - 1}px)` : ''}`,
      nodes: [CSSUtils.createRule(':root')]
    })

    let previous = NGN.coalesce(filteredRanges[index - 1])

    if (index > 0 && !(previous && previous.fontSize === fontSize)) {
      query.nodes[0].append(`font-size: ${fontSize}px;`)
    }

    query.nodes[0].append(`line-height: ${TypographyUtils.calculateLineHeight(fontSize, Math.max(bounds.min, width.min))}`)
    query.nodes.push(...getHeadings(fontSize, Math.max(bounds.min, width.min), false).nodes)

    root.append(query)

    if (!autoScale) {
      return
    }

    let next = NGN.coalesce(filteredRanges[index + 1], {
      fontSize: maxFontSize,
      bounds: {
        min: width.max
      }
    })

    if (!next) {
      return
    }

    let diff = next.fontSize - fontSize
    let fontSizeIncrement = 1

    if (diff <= fontSizeIncrement) {
      return
    }

    let widthIncrement = ((next.bounds.min - bounds.min) / (next.fontSize - fontSize)) * fontSizeIncrement

    for (let w = bounds.min + widthIncrement; w < next.bounds.min; w += widthIncrement) {
      fontSize += fontSizeIncrement
      w = Math.round(w)

      root.append(`
        @media screen and (min-width: ${w}px) {
          :root {
            font-size: ${fontSize}px;
            line-height: ${TypographyUtils.calculateLineHeight(fontSize, w)};
          }

          ${getHeadings(fontSize, w, false).toString()}
        }
      `)
    }
  })

  root.append(`
    @media screen and (min-width: ${width.max}px) {
      :root {
        font-size: ${maxFontSize}px;
        line-height: ${TypographyUtils.calculateLineHeight(maxFontSize, width.max)};
      }

      ${getHeadings(maxFontSize, width.max, false).toString()}
    }
  `)

  return root.toString()
}
