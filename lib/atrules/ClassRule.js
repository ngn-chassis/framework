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

  // validateState (atrule, resolve, reject) {
  //   let state = new StateRule(this, atrule)
  //
  //   state.validate(err => {
  //     if (err) {
  //       return reject(err)
  //     }
  //
  //     if (this.hasState(state.name)) {
  //       return reject(atrule.error(`\nDuplicate state "${state.name}"`, { word: state.name }))
  //     }
  //
  //     if (!this.superclass && !state.selector) {
  //       return reject(atrule.error(`\nState "${state.name}" requires an @selector property`, { word: state.name }))
  //     }
  //
  //     this.states[state.name] = state
  //     resolve()
  //   })
  // }
}
