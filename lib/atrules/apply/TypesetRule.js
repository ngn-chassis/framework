import AtRule from '../AtRule.js'

export default class TypesetRule extends AtRule {
  constructor (atrule) {
    super({
      root: atrule,
      format: 'typeset +|-number',

      args: [{
        name: 'typeset',
        required: true,
        types: ['word'],
        reserved: 'typeset'
      }, {
        name: 'increment',
        types: ['word']
      }]
    })

    this.increment = this.args.hasOwnProperty('increment') ? this.args.increment.value : 0
  }
}
