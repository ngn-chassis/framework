import AtRule from '../AtRule.js'

export default class MakeRule extends AtRule {
  get path () {
    return this.params[1]?.value ?? null
  }

  get theme () {
    return this.params[0]?.value ?? null
  }
}
