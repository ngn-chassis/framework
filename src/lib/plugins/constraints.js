import postcss from 'postcss'
import parser from 'postcss-scss'
import parseValue from 'postcss-value-parser'
import LayoutUtils from '../utilities/LayoutUtils.js'

export default postcss.plugin('chassis-constraints', annotations => {
  return (root, result) => new Promise((resolve, reject) => {
    if (!Reflect.has(annotations, 'constraints')) {
      return resolve(root)
    }

    const { gutter, width, height, minGutterXWidth, maxGutterXWidth } = LayoutUtils

    let raw = `.height.constraint {
  min-height: ${height.min ?? 0}px;
  max-height: ${height.max ? `${height.max}px` : 'initial'};
}

.min.height.constraint {
  max-height: initial;
}

.max.height.constraint {
  min-height: initial;
}

.width.constraint {
  width: 100%;
  min-width: ${width.min}px;
  max-width: ${width.max}px;
  margin-left: auto;
  margin-right: auto;
  padding-left: ${gutter.x};
  padding-right: ${gutter.x};
}

.min.width.constraint {
  max-width: initial;
}

.max.width.constraint {
  min-width: initial;
}`

    if (['vw', '%'].includes(parseValue.unit(gutter.x).unit)) {
      raw += `

@media screen and (max-width: ${width.min}px) {
  .width.constraint {
    padding-left: ${minGutterXWidth};
    padding-right: ${minGutterXWidth};
  }

  .max.width.constraint {
    padding-left: initial;
    padding-right: initial
  }
}

@media screen and (min-width: ${width.max}px) {
  .width.constraint {
    padding-left: ${maxGutterXWidth};
    padding-right: ${maxGutterXWidth};
  }

  .min.width.constraint {
    padding-left: initial;
    padding-right: initial
  }
}`
    }

    annotations.constraints.replaceWith(parser.parse(raw, { from: 'chassis.constraints' }))
    resolve(root)
  })
})
