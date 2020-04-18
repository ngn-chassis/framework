import postcss from 'postcss'
import defaultTheme from '../themes/default.js'

import ErrorUtils from '../utilities/ErrorUtils.js'

import Component from '../Component.js'
import Export from '../Export.js'
import Func from '../Func.js'
import Interface from '../Interface.js'
import Make from '../Make.js'
import Mixin from '../Mixin.js'
import Theme from '../Theme.js'

// function handleComponent (atrule, stylesheet, result, reject) {
//   let component
//
//   try {
//     component = new Component(atrule)
//   } catch (e) {
//     return reject(ErrorUtils.createError({
//       file: result.root.source.input.file,
//       line: atrule.source.start.line,
//       column: atrule.source.start.column,
//       message: [e.message]
//     }))
//   }
//
//   return stylesheet.components.push(component)
// }

export default postcss.plugin('analyze', stylesheet => (root, result) => new Promise((resolve, reject) => {


  // let queue = new NGN.Tasks()
  //
  // queue.on('complete', () => {
  //   if (!stylesheet.themes.some(theme => theme.name === 'default')) {
  //     stylesheet.themes.push(new Theme(postcss.parse(defaultTheme).nodes[0]))
  //   }
  //
  //   resolve(root)
  // })
  //
  // queue.add('    Registering AtRules', next => {
  //   root.walkAtRules(atrule => {
  //     switch (atrule.name) {
  //       case 'component': return handleComponent(atrule, stylesheet, result, reject)
  //
  //       // case 'export':
  //       //   stylesheet.exports.push(new Export(atrule))
  //       //   return atrule.remove()
  //
  //       // case 'function':
  //       //   stylesheet.functions.push(new Func(atrule))
  //       //   return atrule.remove()
  //
  //       // case 'mixin': return stylesheet.mixins.push(new Mixin(atrule))
  //
  //       // case 'theme':
  //       //   stylesheet.themes.push(new Theme(atrule))
  //       //   return atrule.remove()
  //
  //       // case 'make':
  //       //   stylesheet.make.push(new Make(atrule))
  //       //   return atrule.remove()
  //     }
  //   })
  //
  //   next()
  // })
  //
  // queue.run(true)
}))
