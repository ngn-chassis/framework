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
    smoothScaling: false,
    scaleRatio: Constants.typography.scaleRatios['golden ratio'],

    charConstant: 2.27,
    cpl: 75,

    fontSize: {
      min: defaultMinFontSize,
      max: defaultMaxFontSize,
    },

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
    breakpoints: [],

    ranges: [
      {
        name: 'mobile-portrait',
        orientation: 'portrait',
        width: {
          min: 0,
          max: 480
        }
      },

      {
        name: 'mobile-landscape',
        orientation: 'landscape',
        width: {
          min: 480
        }
      },

      {
        name: 'mobile',
        width: {
          min: 0,
          max: 768
        }
      },

      {
        name: 'tablet-portrait',
        orientation: 'portrait',
        width: {
          min: 768
        }
      },

      {
        name: 'tablet-landscape',
        orientation: 'landscape',
        fontSize: 19,
        width: {
          min: 992
        }
      },

      {
        name: 'tablet',
        width: {
          min: 768,
          max: 1200
        }
      },

      {
        name: 'laptop',
        orientation: 'landscape',
        fontSize: 20,
        width: {
          min: 1200
        }
      },

      {
        name: 'monitor',
        orientation: 'landscape',
        fontSize: 23,
        width: {
          min: 1680
        }
      },

      {
        name: 'big-monitor',
        orientation: 'landscape',
        fontSize: 26,
        width: {
          min: 1920
        }
      }
    ]
  }
}
