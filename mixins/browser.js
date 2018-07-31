module.exports = (function () {
  let _private = new WeakMap()

  return class {
    constructor (chassis) {
      _private.set(this, {chassis})
    }

    /**
  	 * @mixin ieOnly
  	 */
  	ieOnly () {
  		let { utils } = _private.get(this).chassis
      let { atRule, nodes } = arguments[0]

      let params = 'all and (-ms-high-contrast: none)'
      let mediaQuery = utils.css.newMediaQuery(params, nodes)

      atRule.replaceWith(mediaQuery)
  	}
  }
})()
