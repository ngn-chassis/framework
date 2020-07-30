import reset from '../plugins/reset.js'
import customProperties from '../plugins/customProperties.js'
import modifiers from '../plugins/modifiers.js'
import constraints from '../plugins/constraints.js'

export default class CoreModule {
  get name () {
    return 'core'
  }

  get resources () {
    return {
      reset,
      customProperties,
      modifiers,
      constraints
    }
  }
}
