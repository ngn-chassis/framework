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

function handleComponent (atRule, stylesheet, result, reject) {
  let component

  try {
    component = new Component(atRule)
  } catch (e) {
    return reject(ErrorUtils.createError({
      file: result.root.source.input.file,
      line: atRule.source.start.line,
      column: atRule.source.start.column,
      message: [e.message]
    }))
  }

  return stylesheet.components.push(component)
}

export default postcss.plugin('analyze', stylesheet => (root, result) => new Promise((resolve, reject) => {
  let queue = new NGN.Tasks()

  queue.on('complete', () => {
    if (!stylesheet.themes.some(theme => theme.name === 'default')) {
      stylesheet.themes.push(new Theme(postcss.parse(defaultTheme).nodes[0]))
    }

    resolve(root)
  })

  queue.add('    Registering AtRules', next => {
    root.walkAtRules(atRule => {
      switch (atRule.name) {
        case 'component': return handleComponent(atRule, stylesheet, result, reject)

        case 'export':
          stylesheet.exports.push(new Export(atRule))
          return atRule.remove()

        case 'function':
          stylesheet.functions.push(new Func(atRule))
          return atRule.remove()

        // case 'custom-media': return stylesheet.media.push(new CustomMedia(atRule))

        // case 'import': return stylesheet.imports.push(new Import(atRule))

        case 'interface':
          stylesheet.interfaces.push(new Interface(atRule))
          return atRule.remove()

        case 'mixin': return stylesheet.mixins.push(new Mixin(atRule))

        case 'theme':
          stylesheet.themes.push(new Theme(atRule))
          return atRule.remove()

        case 'make':
          stylesheet.make.push(new Make(atRule))
          return atRule.remove()
      }
    })

    next()
  })

  queue.run(true)
}))
