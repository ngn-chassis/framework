import AtRule from '../AtRule.js'

export default class TypesetRule extends AtRule {
  constructor (atrule) {
    super({
      root: atrule,
      format: '+|-number',

      args: [{
        name: 'modifier',
        required: true,
        types: ['word']
      }]
    })

    this.modifier = this.args.modifier.value
  }
}
