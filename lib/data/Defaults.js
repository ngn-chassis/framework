import Constants from './Constants.js'
import TypographyUtils from '../utilities/TypographyUtils.js'

export default {
  scope: '.chassis',

  validFileExtensions: ['css', 'chss', 'ccss', 'scss'],

  beautify: {
    indentSize: 2
  },

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
    baseFontSize: 17,

    charConstant: 2.27,
    cpl: 75,

    headings: {
      h1: +3,
      h2: +2,
      h3: +1,
      h4: 0,
      h5: -1,
      h6: -1,
      legend: +1
    },

    scaleRatio: Constants.typography.scaleRatios['golden ratio'],
  },

  breakpoints: [
    {
      name: 'mobile',
      breakpoints: [
        { name: 'mobile-portrait' },
        480,
        { name: 'mobile-landscape' }
      ]
    },

    768,

    {
      name: 'tablet',
      breakpoints: [
        { name: 'tablet-portrait' },
        992,
        {
          name: 'tablet-landscape',
          fontSize: 19,
          columns: 2
        }
      ]
    },

    1200,

    {
      name: 'computer',
      breakpoints: [
        {
          name: 'laptop',
          fontSize: 21,
          columns: 3
        },

        1680,

        {
          name: 'monitor',
          fontSize: 25,
          columns: 3
        },

        1920,

        {
          name: 'big-monitor',
          fontSize: 30,
          columns: 3
        }
      ]
    }
  ]
}
