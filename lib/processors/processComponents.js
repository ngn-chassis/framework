import postcss from 'postcss'

import CSSUtils from '../utilities/CSSUtils.js'
import ComponentUtils from '../utilities/ComponentUtils.js'
import ErrorUtils from '../utilities/ErrorUtils.js'

function coalesceExtensions (stylesheet) {
  let { components } = stylesheet

  return components.reduce((ext, component) => {
    if (!component.isExtension) {
      return ext
    }

    let extension = component.extends

    if (!components.some(component => component.name === extension)) {
      return reject(ErrorUtils.createError(Object.assign({}, component.source, {
        message: [`Cannot extend unknown component "${extension}"`]
      })))
    }

    if (ext.hasOwnProperty(extension)) {
      ext[extension].push(component)
    } else {
      ext[extension] = [component]
    }

    component.reconcileStates(components.find(component => component.name === extension).states)

    return ext
  }, Object.assign({}, stylesheet.extensions))
}

export default postcss.plugin('components', stylesheet => (root, result) => new Promise((resolve, reject) => {
  stylesheet.extensions = coalesceExtensions(stylesheet)

  let queue = new NGN.Tasks()

  queue.on('complete', () => resolve(root))

  stylesheet.components.forEach(component => {
    queue.add(`Rendering "${component.name}" component`, async (next) => {
      ComponentUtils.processComponent(component, stylesheet, output => {
        output.source = component.root.source
        component.root.replaceWith(output)
        next()
      })
    })
  })

  queue.run(true)
}))
