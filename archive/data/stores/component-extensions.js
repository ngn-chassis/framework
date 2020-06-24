module.exports = class ChassisComponentExtensionsStore {
  constructor (chassis) {
    Object.defineProperties(this, {
      store: NGN.privateconst(new NGN.DATA.Store({
        model: new NGN.DATA.Model({
          fields: {
            component: String,
            selectors: Array
          }
        })
      }))
    })
  }

  get data () {
    return this.store.data
  }

  add (component, selectors) {
    this.store.add({component, selectors})
  }

  contains (component) {
    let ext = this.store.find({component})[0]
    return !!ext
  }

  extend (component, selectors) {
    let ext = this.store.find({component})[0]
    ext.selectors.push(...selectors)
  }

  get (component) {
    let ext = this.store.find({component})[0]
    return ext.data
  }
}
