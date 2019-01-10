module.exports = (function () {
	let _ = new WeakMap()

	return class {
    constructor (chassis) {
      _.set(this, {chassis})

      this.resetType = 'block'
    }

    get variables () {
  		return {}
    }
	}
})()
