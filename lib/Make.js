import AtRule from './AtRule.js'

export default class Make extends AtRule {
  constructor (atRule) {
    super(atRule)
    this.theme = this.args[0].value
  }
}
