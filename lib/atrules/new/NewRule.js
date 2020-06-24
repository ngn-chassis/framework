import InlineComponentRule from '../component/InlineComponentRule.js'

export default class ImplementRule extends InlineComponentRule {
  constructor (rule) {
    super(rule)
    this.component = this.args.component.value
  }
}
