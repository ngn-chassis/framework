module.exports = (function () {
  let _ = new WeakMap()

  return class ChassisComponentOverridesStore {
    constructor (chassis) {
      _.set(this, {
        store: new NGN.DATA.Store({
          model: new NGN.DATA.Model({
            fields: {
              component: String
            },

            relationships: {
              states: [new NGN.DATA.Model({
                fields: {
                  name: String,
                  properties: Object,
                  rules: Object
                }
              })]
            }
          })
        })
      })
    }

    add (component, states = []) {
      _.get(this).store.add({component, states})
    }

    addState (component, state) {
      let override = _.get(this).store.find({component})[0]
      override.states.add(state)
    }

    contains (component) {
      let override = _.get(this).store.find({component})[0]
      return !!override
    }

    extend (component, state) {
      let override = _.get(this).store.find({component})[0]
      override.states.add(state)
    }

    get (component) {
      let override = _.get(this).store.find({component})[0]
      return override.data
    }

    getState (component, state) {
      let override = _.get(this).store.find({component})[0]
      return override.states.find({
        name: state
      })[0].data
    }
  }
})()
