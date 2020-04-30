import CSSUtils from '../utilities/CSSUtils.js'

export default {
  name: 'default',

  properties: [
    CSSUtils.createDeclObj('--root-bg-color', 'white'),
    CSSUtils.createDeclObj('--text-color', 'rgb(59,59,59)')
  ],

  components: {
    anchor: {
      styles: [
        CSSUtils.createDeclObj('color', 'black'),
        CSSUtils.createDeclObj('text-decoration', 'underline')
      ]
    },

    button: {
      styles: [
        CSSUtils.createDeclObj('background', 'lightgrey')
      ]
    },

    table: {
      styles: [
        CSSUtils.createDeclObj('table-layout', 'fixed'),
        CSSUtils.createDeclObj('width', '100%'),
        CSSUtils.createDeclObj('border-collapse', 'collapse'),
        CSSUtils.createDeclObj('border-spacing', '0'),

        CSSUtils.createRule('& th, & td', [
          CSSUtils.createDeclObj('overflow', 'hidden'),
          CSSUtils.createDeclObj('text-align', 'left'),
          CSSUtils.createDeclObj('text-overflow', 'ellipsis'),
          CSSUtils.createDeclObj('vertical-align', 'top')
        ]),

        CSSUtils.createRule('& caption', [
          CSSUtils.createDeclObj('text-align', 'left')
        ])
      ],

      states: {
        empty: [],
        'focus-within': []
      }
    }
  }
}
