import AtRule from './AtRule.js'
import StateRule from './state/StateRule.js'

export default class Class extends AtRule {
  name = null
  action = null
  superclass = null
  states = {}

  constructor (cfg) {
    cfg.format = '<name>[ extends <class>]'

    cfg.args = [
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

    super(cfg)
  }

  getState (name) {
    return this.states[name]
  }

  hasState (name) {
    return this.states.hasOwnProperty(name)
  }

  validate (cb) {
    super.validate(err => {
      if (err) {
        return cb(err)
      }

      let { name, action, superclass } = this.args

      this.name = name.value
      this.action = action

      if (superclass) {
        this.superclass = superclass.value
      } else if (this.args.hasOwnProperty('superclass')) {
        return cb(this.error(`\nMissing argument "superclass"`, { index: this.root.params.length }))
      }

      cb()
    })
  }

  validateState (atrule, resolve, reject) {
    let state = new StateRule(this, atrule)

    state.validate(err => {
      if (err) {
        return reject(err)
      }

      if (this.hasState(state.name)) {
        return reject(atrule.error(`\nDuplicate state "${state.name}"`, { word: state.name }))
      }

      if (!this.superclass && !state.selector) {
        return reject(atrule.error(`\nState "${state.name}" requires an @selector property`, { word: state.name }))
      }

      this.states[state.name] = state
      resolve()
    })
  }
}
