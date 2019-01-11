module.exports = class {
  constructor (chassis) {
    Object.defineProperties(this, {
      chassis: NGN.privateconst(chassis)
    })
  }

  /**
   * @mixin ieOnly
   */
  ieOnly () {
    let { utils } = this.chassis
    let { atRule, nodes } = arguments[0]

    let params = 'all and (-ms-high-contrast: none)'
    let mediaQuery = utils.css.createMediaQuery(params, nodes)

    atRule.replaceWith(mediaQuery)
  }
}
