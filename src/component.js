const ChassisSpecSheet = require('./spec-sheet.js')
const ChassisStyleSheet = require('./style-sheet.js')

class ChassisComponent {
  constructor (chassis, type, customSpec, extending = false) {
    this.chassis = chassis
    this.type = type
    
    this.instance = new (chassis.constants.components.get(type))(chassis)
    this.theme = chassis.theme.getComponentSpec(type)
    
    this.defaultSpec = new ChassisSpecSheet(this.chassis, type, chassis.utils.files.parseStyleSheet(`../components/${type}/spec.css`), this.instance)
    this.customSpec = customSpec
  }
  
  get customRules () {
    if (!this.customSpec) {
      return null
    }
    
    return this.defaultSpec.getCustomizedCss(this.customSpec)
  }
  
  get unthemed () {
    if (!this.customSpec) {
      return this.defaultSpec.css
    }
    
    return this.defaultSpec.getUnthemedCss(this.customSpec)
  }
  
  get themed () {
    let { chassis } = this
    
    if (this.type === 'link') {
      this._storeLinkOverrideProps()
    }
    
    return this.theme ? this.defaultSpec.getThemedCss(this.theme) : this.defaultSpec.css
  }
  
  /**
   * @method getStateTheme
   * Get theme properties and rules for a particular component state
   * @param  {string} state
   * @return {object}
   */
  _getStateTheme (state) {
    let theme = this.chassis.theme.getComponent(this.type)
    
		if (!theme || !theme.hasOwnProperty(state)) {
			return null
		}

		return theme[state]
	}
  
  /**
   * @method _storeLinkOverrideProps
   * Store link properties so they can be selectively overwritten by components
   * which use <a> tags in conjunction with classes or attributes
   * @private
   */
  _storeLinkOverrideProps () {
    // All decls applied to <a> tags will be unset or overridden on other
    // components that use <a> tags in conjunction with a class or attr
    this.defaultSpec.states.forEach((state) => {
      let theme = this._getStateTheme(state)
      
      if (!theme || Object.keys(theme).length === 0) {
        return
      }
      
      this.chassis.linkOverrides[state] = {
        properties: theme.properties,
        rules: theme.rules
      }
    })
  }
}

module.exports = ChassisComponent
