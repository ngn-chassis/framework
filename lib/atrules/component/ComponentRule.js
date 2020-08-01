import StateRule from '../state/StateRule.js'

export default class ComponentRule extends StateRule {
  constructor (atrule) {
    super(atrule, [
      'not',
      'reset',
      'selector',
      'state',
      'unset'
    ])
  }

  get not () {
    return this.getProperty('not')?.params ?? null
  }

  get reset () {
    return this.getProperty('reset')?.params ?? null
  }

  get unset () {
    return this.getProperty('unset')?.params ?? null
  }
}
