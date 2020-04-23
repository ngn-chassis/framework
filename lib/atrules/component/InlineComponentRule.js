import AtRule from '../AtRule.js'

export default class InlineComponentRule extends AtRule {
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

      this.parentRule = this.#getParent(this.root)
      this.name = NGN.DATA.util.GUID()

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
