import AtRule from '../AtRule.js'

export default class ApplyRule extends AtRule {
  constructor (atrule) {
    super({
      root: atrule,
      format: 'arg[ arg[ ...]]',

      args: [{
        name: 'type',
        required: true,
        types: ['word']
      }]
    })

    this.type = this.args.type.value
  }
}
