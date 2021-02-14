import ClassRule from '../ClassRule.js'

export default class StateRule extends ClassRule {
  constructor (atrule, properties) {
    super(atrule, properties || ['selector', 'state'])
  }

  get selector () {
    return this.getProperty('selector')?.params ?? null
  }

  get states () {
    let states = this.getProperty('state')

    if (!states) {
      return []
    }

    if (!Array.isArray(states)) {
      states = [states]
    }

    return states.map(state => new StateRule(state))
  }
}
