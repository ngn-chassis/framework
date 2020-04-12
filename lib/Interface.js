import AtRule from './AtRule.js'

export default class Interface extends AtRule {
  constructor (atRule) {
    super(atRule)
    this.name = this.args[0].value

    atRule.walkAtRules(node => {
      switch (node.name) {
        case 'state':

          break;

        default:  
      }
    })
  }
}
