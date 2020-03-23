import postcss from 'postcss'
import defaultTheme from '../themes/default.js'

import Component from '../Component.js'
import Export from '../Export.js'
import Func from '../Func.js'
import Import from '../Import.js'
import Interface from '../Interface.js'
import Mixin from '../Mixin.js'
import Theme from '../Theme.js'

export default postcss.plugin('analyze', styleSheet => root => new Promise((resolve, reject) => {
  let queue = new NGN.Tasks()

  queue.on('complete', () => resolve(root))

  queue.add('    Registering AtRules', next => {
    root.walkAtRules(atRule => {
      switch (atRule.name) {
        case 'component':
          styleSheet.components.push(new Component(atRule))
          return atRule.remove()

        case 'export':
          styleSheet.exports.push(new Export(atRule))
          return atRule.remove()

        case 'function':
          styleSheet.functions.push(new Func(atRule))
          return atRule.remove()

        case 'import': return styleSheet.imports.push(new Import(atRule))

        case 'interface':
          styleSheet.interfaces.push(new Interface(atRule))
          return atRule.remove()

        case 'mixin': return styleSheet.mixins.push(new Mixin(atRule))

        case 'theme':
          styleSheet.themes.push(new Theme(atRule))
          return atRule.remove()

        case 'make':
          styleSheet.make.push(atRule.value)
          return atRule.remove()
      }
    })

    next()
  })

  if (styleSheet.themes.length === 0) {
    queue.add('    Initializing default theme', next => {
      styleSheet.themes.push(new Theme(postcss.parse(defaultTheme).nodes[0]))
      styleSheet.make = ['default']
      next()
    })
  }

  queue.run(true)
}))
