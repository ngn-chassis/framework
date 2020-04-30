import Class from '../Class.js'

// TODO: Automatically reorder states
// Put selectors with pseudo-classes in them at the bottom.
// Check for hover, active, visited, and place them in the proper order

export default class State extends Class {
  #selector = null
  #states = []
  #styles = []

  constructor (cfg) {
    super(cfg)

    this.#selector = cfg.selector
    this.#styles = cfg.styles
    this.#states = cfg.states.map(rule => new State(rule))

    // TODO: Sort states
    // this.states = cfg.states.map(state => new State(state))
  }

  get selector () {
    return this.#selector
  }

  get states () {
    return this.#states
  }

  get hasStates () {
    return this.#states.length > 0
  }

  get styles () {
    return this.#styles
  }

  get hasStyles () {
    return this.#styles.length > 0
  }

  getState (name) {
    return this.states.find(state => state.name === name)
  }

  hasState (name) {
    return this.states.some(state => state.name === name)
  }
}



// import Base from '../Base.js'
// import CSSUtils from '../../../utilities/CSSUtils.js'
//
// export default class State extends Base {
//   // error (message, cfg) {
//   //   return this.#state.error(message, cfg)
//   // }
//   //
//   // resolve (cb) {
//   //   let root = this.selector ? CSSUtils.createRule(this.selector) : CSSUtils.createRoot([])
//   //   root.append(this.styles)
//   //
//   //   let queue = new NGN.Tasks()
//   //
//   //   queue.on('complete', () => cb(null, root))
//   //
//   //   this.states.forEach(state => {
//   //     queue.add('Resolving State', next => {
//   //       state.resolve((err, result) => {
//   //         if (err) {
//   //           return cb(err)
//   //         }
//   //
//   //         root.append(result)
//   //         next()
//   //       })
//   //     })
//   //   })
//   //
//   //   queue.run(true)
//   // }
// }
