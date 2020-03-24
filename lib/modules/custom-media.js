import Config from '../data/Config.js'
import CSSUtils from '../utilities/CSSUtils.js'

export default function generateCustomMediaQueries () {
  let { widthRanges } = Config.viewport
  let root = CSSUtils.createRoot([])

  widthRanges.forEach((range, index) => {
    let { min, max } = range.bounds
    let rules = []

    if (min && max) {
      rules.push(CSSUtils.createAtRule({
				name: 'custom-media',
				params: `--${range.name} screen and (min-width: ${min}px) and (max-width: ${max}px)`
			}))
    }

    if (index < widthRanges.length - 1) {
      if (min > 0) {
        rules.unshift(CSSUtils.createAtRule({
					name: 'custom-media',
					params: `--${range.name}-and-below screen and (max-width: ${max}px)`
				}))

				rules.unshift(CSSUtils.createAtRule({
					name: 'custom-media',
					params: `--below-${range.name} screen and (max-width: ${min - 1}px)`
				}))
			}

      if (index > 0) {
        rules.push(CSSUtils.createAtRule({
  				name: 'custom-media',
  				params: `--${range.name}-and-above screen and (min-width: ${min}px)`
  			}))

        if (index < widthRanges.length - 2) {
          rules.push(CSSUtils.createAtRule({
    				name: 'custom-media',
    				params: `--above-${range.name} screen and (min-width: ${max + 1}px)`
    			}))
        }
      }
    }

    if (index === widthRanges.length - 1) {
      rules.push(CSSUtils.createAtRule({
        name: 'custom-media',
        params: `--${range.name} screen and (min-width: ${min + 1}px)`
      }))
    }

    root.append(...rules)
  })

  return root.toString()
}
