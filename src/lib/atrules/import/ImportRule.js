import AtRule from '../AtRule.js'

export default class ImportRule extends AtRule {
  get resource () {
    return this.params[0]
  }

  get source () {
    return this.params[2]
  }

  get type () {
    switch (this.resource.type) {
      case 'string': return 'file'
      case 'function': return 'function'
      default: return this.source ? 'module' : 'file'
    }
  }
}
