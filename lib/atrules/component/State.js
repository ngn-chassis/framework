import CSSUtils from '../../utilities/CSSUtils.js'

export default class State {
  constructor (state) {
    this.name = state.name
    this.selector = state.selector
    this.styles = state.styles

    this.states = Reflect.ownKeys(state.states).map(substate => {
      return new State(state.states[substate])
    })

    // TODO: Sort states
  }

  resolve (cb) {
    let root = this.selector ? CSSUtils.createRule(this.selector) : CSSUtils.createRoot([])
    root.append(this.styles)

    let queue = new NGN.Tasks()

    queue.on('complete', () => cb(null, root))

    this.states.forEach(state => {
      queue.add('Resolving State', next => {
        state.resolve((err, result) => {
          if (err) {
            return cb(err)
          }

          root.append(result)
          next()
        })
      })
    })

    queue.run(true)
  }
}
