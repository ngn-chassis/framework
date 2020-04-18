import AtRule from '../AtRule.js'

export default class Make extends AtRule {
  constructor (atrule) {
    super({
      root: atrule,

      format: '<themeName>',

      args: [
        {
          name: 'theme',
          required: true,
          types: ['word']
        }
      ]
    })
  }

  validate (cb) {
    super.validate(err => {
      if (err) {
        cb(err)
      }

      this.theme = this.args.theme.value
      cb()
    })
  }
}
