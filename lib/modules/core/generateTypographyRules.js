import parseValue from 'postcss-value-parser'

import Config from '../../data/Config.js'
import Constants from '../../data/Constants.js'
import TypographyUtils from '../../utilities/TypographyUtils.js'
import LayoutUtils from '../../utilities/LayoutUtils.js'

export default function generateConstraints () {
  let { baseFontSize, baseLineHeight, scaleRatio } = TypographyUtils
  let { width } = LayoutUtils

  return `
    html {
      font-size: ${baseFontSize.min}px;
    }

    body {
      font-size: 1em;
      line-height: ${baseLineHeight.min / baseFontSize.min};
    }

    @media screen and (min-width: ${width.min}px) {
      body {
        font-size: calc(1em + (${baseFontSize.max} - ${baseFontSize.min}) * ((100vw - ${width.min / baseFontSize.min}rem) / (${width.max} - ${width.min})));
        line-height: calc(${baseLineHeight.min / baseFontSize.min}rem + (${baseLineHeight.max} - ${baseLineHeight.min}) * ((100vw - ${width.min / baseFontSize.min}rem) / (${width.max} - ${width.min})));
      }
    }

    @media screen and (min-width: 2560px) {
      body {
        font-size: ${baseFontSize.max / baseFontSize.min}em;
        line-height: ${baseLineHeight.max / baseFontSize.max};
      }
    }
  `
}
