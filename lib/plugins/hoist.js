import postcss from 'postcss'
import parser from 'postcss-scss'
import CSSUtils from '../utilities/CSSUtils.js'

export default postcss.plugin('chassis-hoist', (annotations, nodes) => {
  return (root, result) => new Promise((resolve, reject) => {
    let rule = CSSUtils.createRoot()
    nodes.forEach(node => rule.append(node))

    // TODO: Find out why .toString() is required here- it shouldn't be
    annotations.hoist.replaceWith(parser.parse(rule, { from: 'chassis.hoisted-nodes' }).toString())
    resolve(root)
  })
})
