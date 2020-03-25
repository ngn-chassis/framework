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

    ${Constants.layout.outerContainers.join(', ')} {
      margin-bottom: ${baseLineHeight.min * scaleRatio}px;
    }

    ${Constants.layout.innerContainers.join(', ')} {
      margin-bottom: ${baseLineHeight.min}px;
    }

    @media (min-width: ${width.min}px) {
      html {
        font-size: calc(${TypographyUtils.getCalcValue(baseFontSize, width)});
      }

      ${Constants.reset.selectorList.join(', ')},
      input,
      textarea,
      button {
        line-height: calc(${TypographyUtils.getCalcValue(baseLineHeight, width)});
      }

      ${Constants.layout.outerContainers.join(', ')} {
        margin-bottom: calc((${TypographyUtils.getCalcValue(baseLineHeight, width)}) * ${scaleRatio});
      }

      ${Constants.layout.innerContainers.join(', ')} {
        margin-bottom: calc(${TypographyUtils.getCalcValue(baseLineHeight, width)});
      }
    }

    @media (min-width: ${width.max}px){
      html {
        font-size: ${baseFontSize.max}px;
      }

      ${Constants.reset.selectorList.join(', ')},
      input,
      textarea,
      button {
        line-height: ${baseLineHeight.max / baseFontSize.max};
      }

      ${Constants.layout.outerContainers.join(', ')} {
        margin-bottom: ${baseLineHeight.max * scaleRatio}px;
      }

      ${Constants.layout.innerContainers.join(', ')} {
        margin-bottom: ${baseLineHeight.max}px;
      }
    }
  `
}
