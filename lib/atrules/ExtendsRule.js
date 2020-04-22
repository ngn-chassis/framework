import AtRule from './AtRule.js'

export default class ExtendsRule extends AtRule {
  name = NGN.DATA.util.GUID()
  extends = null
  parent = null
  parentRule = null

  constructor (atrule) {
    super({
      root: atrule,
      format: '<component>',
      args: [
        {
          name: 'component',
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

      this.extends = this.args.component.value
      this.parentRule = this.#getParent(this.root)

      cb()
    })
  }

  #getParent = (child, cb) => {
    let { parent } = child

    if (parent.type !== 'rule') {
      return this.#getParent(parent)
    }

    return parent
  }
}
