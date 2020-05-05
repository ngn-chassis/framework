import AtRule from './AtRule.js'

export default class ClassRule extends AtRule {
  type = null
  superclass = null
  name = null

  constructor (cfg) {
    super({
      root: cfg.root,

      format: '<name>[ extends <class>]',

      args: [
        {
          name: 'name',
          required: true,
          types: ['word']
        },

        { types: ['space'] },

        {
          name: 'action',
          types: ['word'],
          reserved: 'extends'
        },

        { types: ['space'] },

        {
          name: 'superclass',
          types: ['word']
        }
      ]
    })

    this.type = cfg.type

    let { name, superclass } = this.args

    this.name = name.value

    if (superclass) {
      this.superclass = superclass.value
    } else if (this.args.hasOwnProperty('action')) {
      return cb(this.error(`\nMissing argument "superclass"`, { index: this.root.params.length }))
    }
  }

  get isExtension () {
    return !!this.superclass
  }
}
