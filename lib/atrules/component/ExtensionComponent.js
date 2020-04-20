import Component from './Component.js'
import CSSUtils from '../../utilities/CSSUtils.js'

export default class ExtensionComponent extends Component {
  constructor (parent, component) {
    super(component)

    this.parent = parent
    this.extends = component.extends
    this.reset = NGN.coalesce(component.reset, parent.reset)
  }

  resolve () {
    // let root = super.resolve()
    return super.resolve()
    // let root = CSSUtils.createRoot([])
    //
    //
    //
    // root.append()
  }
}
