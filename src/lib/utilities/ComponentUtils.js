import parser from 'postcss-scss'

import ComponentRule from '../atrules/component/ComponentRule.js'

export default class ComponentUtils {
  static createComponent (name, css) {
    return new ComponentRule(parser.parse(css, { from: `chassis.${name}` }).nodes[0])
  }
}
