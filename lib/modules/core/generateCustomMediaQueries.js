import Config from '../../data/Config.js'
import CSSUtils from '../../utilities/CSSUtils.js'
import ViewportUtils from '../../utilities/ViewportUtils.js'

export default function generateCustomMediaQueries () {
  let { ranges } = Config.viewport
  let { width, height } = Config.layout

  let root = CSSUtils.createRoot([
    ...ranges.map(range => {
      return ViewportUtils.generateRangeCustomMedia(range)
    }),

    // This is required in order to get a semicolon
    // at the end of the last @custom-media rule
    CSSUtils.createRoot([])
  ])

  return root.toString()
}
