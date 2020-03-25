import parseValue from 'postcss-value-parser'

import LayoutUtils from '../../utilities/LayoutUtils.js'
import CSSUtils from '../../utilities/CSSUtils.js'

export default function generateConstraints () {
  let { gutter, width, height, minGutterWidth, maxGutterWidth } = LayoutUtils

  let root = CSSUtils.createRoot([])

  root.append(`
    .height.constraint {
      min-height: ${NGN.coalesce(height.min, 0)}px;
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
    }
  `)

  if (['vw', '%'].includes(parseValue.unit(gutter.x).unit)) {
    root.append(`
      @media screen and (max-width: ${width.min}px) {
        .width.constraint {
          padding-left: ${minGutterWidth};
          padding-right: ${minGutterWidth};
        }

        .max.width.constraint {
          padding-left: initial;
          padding-right: initial
        }
      }

      @media screen and (min-width: ${width.max}px) {
        .width.constraint {
          padding-left: ${maxGutterWidth};
          padding-right: ${maxGutterWidth};
        }

        .min.width.constraint {
          padding-left: initial;
          padding-right: initial
        }
      }
    `)
  }

  return root.toString()
}
