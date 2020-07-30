import parser from 'postcss-scss'
// import nesting from 'postcss-nesting'
// import CSSUtils from './CSSUtils.js'
// import QueueUtils from './QueueUtils.js'
// import SelectorUtils from './SelectorUtils.js'

import ComponentRule from '../atrules/component/ComponentRule.js'

export default class ComponentUtils {
  static createComponent (name, css) {
    return new ComponentRule(parser.parse(css, { from: `chassis.${name}` }).nodes[0])
  }
}
