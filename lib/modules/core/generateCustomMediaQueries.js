import Config from '../../data/Config.js'
import CSSUtils from '../../utilities/CSSUtils.js'
import ViewportUtils from '../../utilities/ViewportUtils.js'

export default function generateCustomMediaQueries () {
  let { widthRanges } = Config.viewport
  let { width, height } = Config.layout

  let root = CSSUtils.createRoot([])

  if (width.min > 1) {
    Config.generatedRanges.push({
      type: 'width',
      name: 'under-min-width',
      bounds: {
        max: width.min - 1
      }
    })
  }

  if (width.min > 0) {
    Config.generatedRanges.push({
      type: 'width',
      name: 'min-width-and-under',
      bounds: {
        max: width.min
      }
    })
  }

  widthRanges.forEach((range, i) => {
    let { bounds, name, alternateNames } = range

    ;[name, ...alternateNames].forEach(name => {
      if (i !== 0 && bounds.min) {
        Config.generatedRanges.push({
          type: 'width',
          name: `under-${name}`,
          bounds: {
            max: bounds.min - 1
          }
        })

        if (bounds.max) {
          Config.generatedRanges.push({
            type: 'width',
            name: `${name}-and-under`,
            bounds: {
              max: bounds.max - 1
            }
          })
        }
      }

      Config.generatedRanges.push({
        type: 'width',
        name,
        bounds: {
          min: NGN.coalesce(bounds.min),
          max: bounds.max ? bounds.max - 1 : null
        }
      })

      if (1 !== widthRanges.length - 1) {
        if (bounds.min) {
          Config.generatedRanges.push({
            type: 'width',
            name: `${name}-and-over`,
            bounds: {
              min: bounds.min,
            }
          })
        }

        if (bounds.max) {
          Config.generatedRanges.push({
            type: 'width',
            name: `over-${name}`,
            bounds: {
              min: bounds.max + 1,
            }
          })
        }
      }
    })
  })

  if (height.min > 1) {
    Config.generatedRanges.push({
      type: 'height',
      name: 'under-min-height',
      bounds: {
        max: height.min - 1
      }
    })
  }

  if (height.min > 0) {
    Config.generatedRanges.push({
      type: 'height',
      name: 'min-height-and-under',
      bounds: {
        max: height.min
      }
    })
  }

  // heightRanges.forEach()

  if (height.max) {
    Config.generatedRanges.push({
      type: 'height',
      name: 'under-max-height',
      bounds: {
        max: height.max - 1
      }
    }, {
      type: 'height',
      name: 'max-height-and-under',
      bounds: {
        max: height.max
      }
    }, {
      type: 'height',
      name: 'max-height-and-over',
      bounds: {
        min: height.max
      }
    }, {
      type: 'height',
      name: 'over-max-height',
      bounds: {
        min: height.max + 1
      }
    })
  }

  Config.generatedRanges.forEach(range => {
    root.append(ViewportUtils.generateCustomMedia(range))
  })

  return `${root.toString()};`
}
