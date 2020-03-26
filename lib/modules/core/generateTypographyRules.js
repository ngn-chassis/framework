import Config from '../../data/Config.js'
import Constants from '../../data/Constants.js'

import CSSUtils from '../../utilities/CSSUtils.js'
import TypographyUtils from '../../utilities/TypographyUtils.js'

export default function generateConstraints () {
  let { baseFontSize, scaleRatio } = Config.typography
  let { width } = Config.layout
  let { widthRanges } = Config.viewport

  let root = CSSUtils.createRoot([])

  root.append(`
    :root {
      font-size: ${baseFontSize}px;
    }
  `)

  let filteredRanges = widthRanges.filter(range => !!range.fontSize)

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

    query.nodes[0].append(`line-height: ${TypographyUtils.calculateLineHeight(fontSize, Math.max(bounds.min, Config.layout.width.min))};`)

    root.append(query)

    let next = filteredRanges[index + 1]

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
        }
      `)
    }
  })

  return root.toString()
}