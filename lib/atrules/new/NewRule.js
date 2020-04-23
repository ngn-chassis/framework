import ComponentRule from '../component/ComponentRule.js'
import InlineComponentRule from '../component/InlineComponentRule.js'

export default class ImplementRule extends InlineComponentRule {
  component = null

  validate (cb) {
    super.validate(err => {
      if (err) {
        return cb(err)
      }

      this.component = this.args.component.value
      cb()
    })
  }
}
