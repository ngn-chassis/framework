import Constants from './Constants.js'
import TypographyUtils from '../utilities/TypographyUtils.js'

const defaultMinFontSize = 17
const defaultMaxFontSize = 32

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
    smoothScaling: true,
    minFontSize: defaultMinFontSize,
    maxFontSize: defaultMaxFontSize,
    scaleRatio: Constants.typography.scaleRatios['golden ratio'],

    headings: {
      1: +3,
      2: +2,
      3: +1,
      4: 0,
      5: -1,
      6: -1,
      legend: +1
    }
  },

  viewport: {
    widthRanges: [
      {
        name: 'mobile-portrait',
        alternateNames: ['mobile-p'],
        fontSize: defaultMinFontSize,
        bounds: {
          max: 480
        }
      },

      {
        name: 'mobile-landscape',
        alternateNames: ['mobile-l'],
        bounds: {
          min: 480,
          max: 768
        }
      },

      {
        name: 'mobile',
        bounds: {
          max: 768
        }
      },

      {
        name: 'tablet-portrait',
        alternateNames: ['tablet-p'],
        bounds: {
          min: 768,
          max: 992
        }
      },

      {
        name: 'tablet-landscape',
        alternateNames: ['tablet-l'],
        fontSize: 19,
        bounds: {
          min: 992,
          max: 1200
        }
      },

      {
        name: 'tablet',
        bounds: {
          min: 768,
          max: 1200
        }
      },

      {
        name: 'laptop',
        fontSize: 20,
        bounds: {
          min: 1200,
          max: 1680
        }
      },

      {
        name: 'desktop',
        fontSize: 22,
        bounds: {
          min: 1680,
          max: 1920
        }
      },

      {
        name: 'big-desktop',
        fontSize: 24,
        bounds: {
          min: 1920
        }
      },

      {
        name: 'monitor',
        bounds: {
          min: 1680
        }
      },
    ]//,
    // heightRanges: []
  }
}
