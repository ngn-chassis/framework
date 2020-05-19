import AtRule from '../AtRule.js'

export default class DisplayRule extends AtRule {
  constructor (atrule) {
    super({
      root: atrule,
      format: 'box-model[ padding[-x][-y][-top][-right][-bottom][-left][ margin[-x][-y][-top][-right][-bottom][-left]]]',

      args: [{
        name: 'model',
        required: true,
        types: ['word']
      }, {
        types: ['space']
      }, {
        name: 'attributes',
        required: true,
        multiple: true,
        types: ['word', 'space']
      }]
    })

    this.type = this.args.model.value
    this.attributes = this.args.attributes.value
  }
}
