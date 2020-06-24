import InlineComponentRule from '../component/InlineComponentRule.js'

export default class ExtendRule extends InlineComponentRule {
  constructor (rule) {
    super(rule)
    this.superclass = this.args.component.value
  }
}
