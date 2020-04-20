import AtRule from './AtRule.js'

export default class Placeholder extends AtRule {
  constructor (atrule) {
    super({
      root: atrule,

      format: '<type> <id>',

      args: [
        {
          name: 'type',
          types: ['word'],
          required: true
        },

        { types: ['space'] },

        {
          name: 'id',
          types: ['word'],
          required: true
        }
      ]
    })
  }

  validate (cb) {
    super.validate(err => {
      if (err) {
        return cb(err)
      }
      
      this.type = this.args.type.value
      this.id = this.args.id.value

      cb()
    })
  }
}
