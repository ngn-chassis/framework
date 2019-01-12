let ChassisSpecSheet = require('./spec-sheet.js')
let ChassisStyleSheet = require('./style-sheet.js')

module.exports = class {
  constructor (chassis, type, customSpec = null) {
    this.instance = new (chassis.constants.components.get(type)).component(chassis)
    this.type = type

    this.theme = chassis.theme.getComponentSpec(type)
    this.defaultSpec = new ChassisSpecSheet(chassis, type, chassis.utils.file.parseStyleSheet(`../components/${type}/spec.css`), this.instance)
    this.customSpec = customSpec

    Object.defineProperties(this, {
      chassis: NGN.privateconst(chassis),

      /**
       * @method getStateTheme
       * Get theme properties and rules for a particular component state
       * @param  {string} state
       * @return {object}
       * @private
       */
      getStateTheme: NGN.privateconst(state => {
        let theme = chassis.theme.getComponent(this.type)

        if (!theme || !theme.hasOwnProperty(state)) {
          return null
        }

        return theme[state]
      }),

      /**
       * @method storeComponentOverrides
       * Store component properties so they can be selectively overwritten by
       * other components which use the same tag in conjunction with classes
       * or attributes. For example:
       * <a class="button"> must override certain properties of initial <a> tags.
       * @private
       */
      storeComponentOverrides: NGN.privateconst(() => {
        chassis.componentOverrides.add(this.type)

        this.defaultSpec.states.forEach(state => {
          let theme = this.getStateTheme(state)

          if (!theme || Object.keys(theme).length === 0) {
            return
          }

          chassis.componentOverrides.addState(this.type, {
            name: state,
            properties: theme.properties,
            rules: theme.rules
          })
        })
      })
    })
  }

  get variables () {
    if (!('variables' in this.instance)) {
      return null
    }

    let scopedVariables = {}

    for (let key in this.instance.variables) {
      scopedVariables[`${this.type}-${key}`] = this.instance.variables[key]
    }

    return Object.keys(scopedVariables).length ? scopedVariables : null
  }

  /**
   * @property customCss
   * Returns a CSS AST including ONLY styles passed via either the 'extend' or 'new' mixin
   * @return {AST}
   */
  get customCss () {
    if (!this.customSpec) {
      return null
    }

    return this.defaultSpec.getCustomCss(this.customSpec)
  }

  /**
   * @property themedCss
   * Returns a CSS AST including
   * * the component Default Spec styles, AND
   * * any styles passed via either the 'extend' or 'new' mixin, AND
   * * styles from the master theme.
   * @return {AST}
   */
  get themedCss () {
    let { chassis } = this

    if (this.instance.isOverridable) {
      this.storeComponentOverrides()
    }

    return this.theme ? this.defaultSpec.getThemedCss(this.theme) : this.defaultSpec.css
  }

  /**
   * @property unthemedCss
   * Returns a CSS AST including
   * * the component Default Spec styles, AND
   * * any styles passed via either the 'extend' or 'new' mixin.
   * Does NOT include styles from the master theme.
   * @return {AST}
   */
  get unthemedCss () {
    if (!this.customSpec) {
      return this.defaultSpec.css
    }

    return this.defaultSpec.getUnthemedCss(this.customSpec)
  }
}
