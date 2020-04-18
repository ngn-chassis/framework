import AtRule from './AtRule.js'

export default class Class extends AtRule {
  constructor (cfg) {
    cfg.format = '<name>[ extends <parent>]'

    cfg.args = [
      {
        name: 'name',
        required: true,
        types: ['word']
      },

      { types: ['space'] },

      {
        name: 'extends',
        types: ['word'],
        reserved: 'extends'
      },

      { types: ['space'] },

      {
        name: 'parent',
        types: ['word']
      }
    ]

    super(cfg)
  }

  validate (cb) {
    super.validate(err => {
      if (err) {
        return cb(err)
      }

      let { name, parent } = this.args

      this.name = name.value

      if (parent) {
        this.extends = parent
      } else if (this.args.hasOwnProperty('extends')) {
        return cb(this.error(`\nMissing argument "parent"`, { index: this.root.params.length }))
      }

      cb()
    })
  }
}
