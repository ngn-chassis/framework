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
        types: ['space']
      }, {
        name: 'increment',
        required: true,
        types: ['word']
      }]
    })

    this.increment = this.args.increment.value
  }
}
