import postcss from 'postcss'

import CSSUtils from '../utilities/CSSUtils.js'
import ComponentUtils from '../utilities/ComponentUtils.js'
import ErrorUtils from '../utilities/ErrorUtils.js'

export default postcss.plugin('components', stylesheet => (root, result) => new Promise((resolve, reject) => {
  let { components } = stylesheet
  let queue = new NGN.Tasks()

  stylesheet.extensions = components.reduce((ext, component) => {
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

  // Then, render all components
  components.forEach(component => {
    let output = ComponentUtils.processComponent(component, stylesheet.extensions[component.name])

    output.source = component.root.source
    component.root.replaceWith(output)
  })

  resolve(root)
}))
