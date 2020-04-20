import CSSUtils from '../../utilities/CSSUtils.js'

export default class State {
  constructor (state) {
    this.name = state.name
    this.selector = state.selector
    this.styles = state.styles
    this.states = state.states.map(state => new State(state))
  }

  resolve () {
    let root = this.selector ? CSSUtils.createRule(this.selector) : CSSUtils.createRoot([])

    root.append(this.styles)

    this.states.forEach(state => {
      console.log(state)

      root.append(state.resolve())
    })

    return root
  }
}
