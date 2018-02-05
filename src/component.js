const ChassisSpecSheet = require('./spec-sheet.js')
const ChassisStyleSheet = require('./style-sheet.js')

class ChassisComponent {
  constructor (chassis, type, customSpec = null) {
    this.chassis = chassis
    this.type = type
    this.instance = new (chassis.constants.components.get(type))(chassis)

    this.theme = chassis.theme.getComponentSpec(type)
    this.defaultSpec = new ChassisSpecSheet(this.chassis, type, chassis.utils.files.parseStyleSheet(`../components/${type}/spec.css`), this.instance)
    this.customSpec = customSpec

    Object.defineProperties(this, {
      /**
       * @method getStateTheme
       * Get theme properties and rules for a particular component state
       * @param  {string} state
       * @return {object}
       * @private
       */
      _getStateTheme: NGN.privateconst((state) => {
        let theme = this.chassis.theme.getComponent(this.type)

    		if (!theme || !theme.hasOwnProperty(state)) {
    			return null
    		}

    		return theme[state]
    	}),

      /**
       * @method _storeComponentOverrides
       * Store component properties so they can be selectively overwritten by
       * other components which use the same tag in conjunction with classes
       * or attributes. For example:
       * <a class="button"> must override certain properties of default <a> tags.
       * @private
       */
      _storeComponentOverrides: NGN.privateconst(() => {
        this.chassis.componentOverrides[this.type] = {}

        this.defaultSpec.states.forEach((state) => {
          let theme = this._getStateTheme(state)

          if (!theme || Object.keys(theme).length === 0) {
            return
          }

          this.chassis.componentOverrides[type][state] = {
            properties: theme.properties,
            rules: theme.rules
          }
        })
      })
    })
  }

  // TODO: REvisit the name of this getter
  get customRules () {
    if (!this.customSpec) {
      return null
    }

    return this.defaultSpec.getCustomizedCss(this.customSpec)
  }

  get themedCss () {
    let { chassis } = this

    if (this.instance.isOverridable) {
      this._storeComponentOverrides()
    }

    return this.theme ? this.defaultSpec.getThemedCss(this.theme) : this.defaultSpec.css
  }

  get unthemedCss () {
    if (!this.customSpec) {
      return this.defaultSpec.css
    }

    return this.defaultSpec.getUnthemedCss(this.customSpec)
  }
}

module.exports = ChassisComponent
