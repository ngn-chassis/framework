const path = require('path')

module.exports = {
  layout: {
    minWidth: 320,
    maxWidth: 1920,
    gutter: '4.5vw'
  },

  typography: {
    baseFontSize: 15,
    scaleRatio: 'golden-ratio'
  },

  viewport: {
    widthRanges: [
      {
        name: 'below-min',
        alternateNames: ['xxxs', 'xxxsm', 'xxx-small'],
        bounds: {
          max: 320
        }
      },

      {
        name: 'min',
        alternateNames: ['xxs', 'xxsm', 'xx-small'],
        bounds: {
          min: 320,
          max: 512
        }
      },

      {
        name: 'xs',
        alternateNames: ['xsm', 'x-small'],
        bounds: {
          min: 512,
          max: 768
        }
      },

      {
        name: 's',
        alternateNames: ['sm', 'small'],
        bounds: {
          min: 768,
          max: 1024
        }
      },

      {
        name: 'm',
        alternateNames: ['md', 'med', 'medium'],
        bounds: {
          min: 1024,
          max: 1200
        }
      },

      {
        name: 'l',
        alternateNames: ['lg', 'large'],
        bounds: {
          min: 1200,
          max: 1440
        }
      },

      {
        name: 'xl',
        alternateNames: ['xlg', 'x-large'],
        bounds: {
          min: 1440,
          max: 1600
        }
      },

      {
        name: 'max',
        alternateNames: ['xxl', 'xxlg', 'xx-large'],
        bounds: {
          min: 1600,
          max: 1920
        }
      },

      {
        name: 'above-max',
        alternateNames: ['xxxl', 'xxxlg', 'xxx-large'],
        bounds: {
          min: 1920
        }
      }
    ]
  }
}
