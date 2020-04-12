import AtRule from './AtRule.js'
import ComponentUtils from './utilities/ComponentUtils.js'

export default class Component extends AtRule {
  #err = ''
  states = []
  extends = null

  constructor (atRule) {
    super(atRule)

    let arg1 = this.args[0]

    if (!arg1 || arg1.type !== 'word' || !arg1.value) {
      throw new Error(`Invalid component name. Component name must be a non-empty string.`)
    }

    this.name = arg1.value
    this.#err = `Invalid definition for component "${this.name}"\n       `

    let arg2 = this.args[1]
    let arg3 = this.args[2]

    if (arg2) {
      if (arg2.type === 'word' && arg2.value === 'extends') {
        if (!arg3 || arg3.type !== 'word' || !arg3.value) {
          throw new Error(`${this.#err}Cannot extend "${NGN.coalesce(arg3.value, 'UNKNOWN')}"`)
        }

        this.extends = arg3.value
      }
    }

    let states = []

    atRule.nodes.forEach(node => {
      if (node.type !== 'atrule') {
        throw new Error(`${this.#err}Components can only contain @selector, @reset, and @state rules.`)
      }

      switch (node.name) {
        case 'selector':
          if (this.selector) {
            throw new Error(`${this.#err}Component contains duplicate @selector rules`)
          }

          this.selector = node.params
          break

        case 'reset':
          if (this.reset) {
            throw new Error(`${this.#err}Component contains duplicate @reset rules`)
          }

          this.reset = node.params
          break

        case 'state': return states.push(node)

        default: throw new Error(`${this.#err}Invalid component config property @${node.name}. Components can only contain @selector, @reset, and @state rules.`)
      }
    })

    if (!this.selector) {
      throw new Error(`${this.#err}@selector rule is required.`)
    }

    states.forEach(state => this.addState(state))
  }

  get isExtension () {
    return !!this.extends
  }

  reconcileStates (states) {
    ComponentUtils.reconcileStates(this.states, states)
  }

  addState (atRule) {
    ComponentUtils.parseState(atRule, this.isExtension, (err, result) => {
      if (err) {
        throw new Error(`${this.#err}${err}`)
      }

      this.states.push(result)
    })
  }
}
