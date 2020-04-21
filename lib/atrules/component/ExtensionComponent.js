import Component from './Component.js'
import SelectorUtils from '../../utilities/SelectorUtils.js'

export default class ExtensionComponent extends Component {
  constructor (parent, component) {
    super(component)

    this.parent = parent
    this.extends = component.extends
    this.reset = NGN.coalesce(component.reset, parent.reset)
  }

  resolve (cb) {
    let selector = ''

    SelectorUtils.getNestedSelectorList(this.parent.selector, this.selector, result => {
      this.selector = result.join(', ')
      return super.resolve(cb)
    })
  }
}
