import InlineComponentRule from '../component/InlineComponentRule.js'

export default class ExtendRule extends InlineComponentRule {
  superclass = null

  validate (cb) {
    super.validate(err => {
      if (err) {
        return cb(err)
      }

      this.superclass = this.args.component.value
      cb()
    })
  }
}
