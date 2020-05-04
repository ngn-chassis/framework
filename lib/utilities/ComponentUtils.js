import postcss from 'postcss'
import nesting from 'postcss-nesting'
import CSSUtils from './CSSUtils.js'
import QueueUtils from './QueueUtils.js'
import SelectorUtils from './SelectorUtils.js'

import ComponentRule from '../atrules/component/ComponentRule.js'

export default class ComponentUtils {
  static createComponent (definition) {
    return new ComponentRule(postcss.parse(definition, { from: 'chassis.components' }).nodes[0])
  }
}
