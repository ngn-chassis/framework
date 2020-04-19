import CSSUtils from '../utilities/CSSUtils.js'

export default {
  name: 'default',

  properties: [
    {
      name: '--root-bg-color',
      value: 'white'
    },

    {
      name: '--text-color',
      value: 'rgb(59,59,59)'
    }
  ],

  components: {
    button: {
      states: [
        {
          'name': 'initial',
          'nodes': [
            CSSUtils.createDeclObj('background', 'grey'),
            CSSUtils.createDeclObj('color', 'white')
          ]
        }
      ]
    }
  }
}
