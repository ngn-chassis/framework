module.exports = (function () {
  let _ = new WeakMap()

  return class {
    constructor (chassis) {
      _.set(this, {chassis})
    }

    /**
  	 * @mixin ieOnly
  	 */
  	ieOnly () {
  		let { utils } = _.get(this).chassis
      let { atRule, nodes } = arguments[0]

      let params = 'all and (-ms-high-contrast: none)'
      let mediaQuery = utils.css.newMediaQuery(params, nodes)

      atRule.replaceWith(mediaQuery)
  	}
  }
})()
