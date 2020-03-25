import Config from '../../data/Config.js'
import CSSUtils from '../../utilities/CSSUtils.js'

export default function generateCustomMediaQueries () {
  let { widthRanges } = Config.viewport

  let root = CSSUtils.createRoot([
    CSSUtils.createAtRule({
      name: 'custom-media',
      params: `--phone screen and (min-width: 0px) and (max-width: 599px)`
    }),

    CSSUtils.createAtRule({
      name: 'custom-media',
      params: `--tablet-portrait screen and (min-width: 600px) and (max-width: 899px)`
    }),

    CSSUtils.createAtRule({
      name: 'custom-media',
      params: `--tablet-landscape screen and (min-width: 900px) and (max-width: 1199px)`
    }),

    CSSUtils.createAtRule({
      name: 'custom-media',
      params: `--tablet screen and (min-width: 600px) and (max-width: 1199px)`
    }),

    CSSUtils.createAtRule({
      name: 'custom-media',
      params: `--monitor screen and (min-width: 1200px) and (max-width: 1799px)`
    }),

    CSSUtils.createAtRule({
      name: 'custom-media',
      params: `--big-monitor screen and (min-width: 1800px)`
    })
  ])

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
