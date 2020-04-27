import CSSUtils from '../../../utilities/CSSUtils.js'

export default class State {
  #definition = null
  #parent = null

  constructor (definition) {
    console.log(definition);
    this.#definition = definition
    this.name = definition.name
    this.selector = definition.selector
    this.styles = definition.styles
    this.#parent = definition.parent

    // TODO: Sort states
    this.states = definition.states.map(state => new State(state))
  }

  // get hasStates () {
  //   return this.states.length > 0
  // }
  //
  // error (message, cfg) {
  //   return this.#state.error(message, cfg)
  // }
  //
  // resolve (cb) {
  //   let root = this.selector ? CSSUtils.createRule(this.selector) : CSSUtils.createRoot([])
  //   root.append(this.styles)
  //
  //   let queue = new NGN.Tasks()
  //
  //   queue.on('complete', () => cb(null, root))
  //
  //   this.states.forEach(state => {
  //     queue.add('Resolving State', next => {
  //       state.resolve((err, result) => {
  //         if (err) {
  //           return cb(err)
  //         }
  //
  //         root.append(result)
  //         next()
  //       })
  //     })
  //   })
  //
  //   queue.run(true)
  // }
}
