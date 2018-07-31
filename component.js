const ChassisSpecSheet = require('./spec-sheet.js')
const ChassisStyleSheet = require('./style-sheet.js')

module.exports = (function () {
  let _private = new WeakMap()

  return class {
    constructor (chassis, type, customSpec = null) {
      this.instance = new (chassis.constants.components.get(type)).component(chassis)
      this.type = type

      this.customSpec = customSpec
      this.defaultSpec = new ChassisSpecSheet(chassis, type, chassis.utils.file.parseStyleSheet(`../components/${type}/spec.css`), this.instance),
      this.theme = chassis.theme.getComponentSpec(type),

      _private.set(this, {
        chassis,

        /**
         * @method getStateTheme
         * Get theme properties and rules for a particular component state
         * @param  {string} state
         * @return {object}
         * @private
         */
        getStateTheme: state => {
          let theme = _private.get(this).chassis.theme.getComponent(this.type)

      		if (!theme || !theme.hasOwnProperty(state)) {
      			return null
      		}

      		return theme[state]
      	},

        /**
         * @method storeComponentOverrides
         * Store component properties so they can be selectively overwritten by
         * other components which use the same tag in conjunction with classes
         * or attributes. For example:
         * <a class="button"> must override certain properties of initial <a> tags.
         * @private
         */
        storeComponentOverrides: () => {
          _private.get(this).chassis.componentOverrides[this.type] = {}

          this.defaultSpec.states.forEach(state => {
            let theme = _private.get(this).getStateTheme(state)

            if (!theme || Object.keys(theme).length === 0) {
              return
            }

            _private.get(this).chassis.componentOverrides[type][state] = {
              properties: theme.properties,
              rules: theme.rules
            }
          })
        }
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

    // TODO: Revisit the name of this getter
    get customRules () {
      if (!this.customSpec) {
        return null
      }

      return this.defaultSpec.getCustomizedCss(this.customSpec)
    }

    get themedCss () {
      let { chassis } = this

      if (this.instance.isOverridable) {
        _private.get(this).storeComponentOverrides()
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
})()
