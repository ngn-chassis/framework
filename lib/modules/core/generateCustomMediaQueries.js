import Config from '../../data/Config.js'
import CSSUtils from '../../utilities/CSSUtils.js'

export default function generateCustomMediaQueries () {
  let { widthRanges } = Config.viewport
  let { width } = Config.layout

  let root = CSSUtils.createRoot([])

  root.append(`
    @custom-media --below-min-width screen and (max-width: ${width.min - 1}px);
    @custom-media --min-width-and-below screen and (max-width: ${width.min}px);
    @custom-media --min-width-and-above screen and (min-width: ${width.min}px);
    @custom-media --above-min-width screen and (min-width: ${width.min + 1}px);
    @custom-media --below-max-width screen and (max-width: ${width.max - 1}px);
    @custom-media --max-width-and-below screen and (max-width: ${width.max}px);
    @custom-media --max-width-and-above screen and (min-width: ${width.max}px);
    @custom-media --above-max-width screen and (min-width: ${width.max + 1}px);
  `)

  widthRanges.forEach((range, i) => {
    let { bounds, name, alternateNames } = range

    ;[name, ...alternateNames].forEach(name => {
      if (i !== 0 && bounds.min) {
        root.append(CSSUtils.createAtRule({
          name: 'custom-media',
          params: `--below-${name} screen and (max-width: ${bounds.min - 1}px)`
        }))

        if (bounds.max) {
          root.append(CSSUtils.createAtRule({
            name: 'custom-media',
            params: `--${name}-and-below screen and (max-width: ${bounds.max - 1}px)`
          }))
        }
      }

      root.append(CSSUtils.createAtRule({
        name: 'custom-media',
        params: `--${name} screen${bounds.min ? ` and (min-width: ${bounds.min}px)` : ''}${bounds.max ? ` and (max-width: ${bounds.max - 1}px)` : ''}`
      }))

      if (1 !== widthRanges.length - 1) {
        if (bounds.min) {
          root.append(CSSUtils.createAtRule({
            name: 'custom-media',
            params: `--${name}-and-above screen and (min-width: ${bounds.min}px)`
          }))
        }

        if (bounds.max) {
          root.append(CSSUtils.createAtRule({
            name: 'custom-media',
            params: `--above-${name} screen and (min-width: ${bounds.max + 1}px)`
          }))
        }
      }
    })
  })

  return `${root.toString()};`
}
