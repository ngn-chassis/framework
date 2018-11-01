module.exports = (function () {
  let _ = new WeakMap()

  return class ChassisComponentExtensionsStore {
    constructor (chassis) {
      _.set(this, {
        store: new NGN.DATA.Store({
          model: new NGN.DATA.Model({
            fields: {
              component: String,
              selectors: Array
            }
          })
        })
      })
    }

    get data () {
      return _.get(this).store.data
    }

    add (component, selectors) {
      _.get(this).store.add({component, selectors})
    }

    contains (component) {
      let ext = _.get(this).store.find({component})[0]
      return !!ext
    }

    extend (component, selectors) {
      let ext = _.get(this).store.find({component})[0]
      ext.selectors.push(...selectors)
    }

    get (component) {
      let ext = _.get(this).store.find({component})[0]
      return ext.data
    }
  }
})()
