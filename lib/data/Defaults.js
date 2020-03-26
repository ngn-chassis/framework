import Constants from './Constants.js'
import TypographyUtils from '../utilities/TypographyUtils.js'

const defaultBaseFontSize = 17

export default {
  layout: {
    width: {
      min: 320,
      max: 2560,
    },

    height: {
      min: 400
    },

    gutter: {
      x: '4.5vw',
      y: '0'
    }
  },

  typography: {
    baseFontSize: defaultBaseFontSize,
    scaleRatio: Constants.typography.scaleRatios['golden ratio']
  },

  viewport: {
    widthRanges: [
      {
        name: 'phone',
        fontSize: defaultBaseFontSize,
        bounds: {
          max: 600
        }
      },

      {
        name: 'tablet-portrait',
        alternateNames: ['tablet-p'],
        fontSize: 17,
        bounds: {
          min: 600,
          max: 900
        }
      },

      {
        name: 'tablet-landscape',
        alternateNames: ['tablet-l'],
        fontSize: 19,
        bounds: {
          min: 900,
          max: 1200
        }
      },

      {
        name: 'tablet',
        bounds: {
          min: 600,
          max: 1200
        }
      },

      {
        name: 'mobile',
        bounds: {
          max: 1200
        }
      },

      {
        name: 'desktop',
        bounds: {
          min: 1200
        }
      },

      {
        name: 'monitor',
        fontSize: 21,
        bounds: {
          min: 1200,
          max: 1800
        }
      },

      {
        name: 'big-monitor',
        fontSize: 26,
        bounds: {
          min: 1800
        }
      },

      {
        name: '4K',
        fontSize: 32,
        bounds: {
          min: 2560
        }
      }
    ]
  }
}
