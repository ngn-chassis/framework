import postcss from 'postcss'
import { CONFIG } from '../../index.js'
import CSSUtils from '../utilities/CSSUtils.js'

export default postcss.plugin('chassis-annotate', (annotations, properties, manifest) => {
  return (root, result) => new Promise((resolve, reject) => {
    function annotate (label, id) {
      const atrule = CSSUtils.createAtRule({ name: 'chassis', params: id })
      const output = [atrule]

      annotations[id] = atrule

      if (label) {
        output.unshift(CSSUtils.createComment(`${label} ${'*'.repeat(73 - label.length)}`))
      }

      return output
    }

    const placeholders = [
      ...annotate(null, 'charset'),
      ...annotate(null, 'hoist'),
      ...annotate(null, 'viewport')
    ]

    if (manifest.hasCoreModule('reset')) {
      placeholders.push(...annotate('Browser Reset', 'reset'))
    }

    if (properties.length > 0 || manifest.hasCoreModule('customProperties')) {
      placeholders.push(...annotate('Custom Properties', 'customProperties'))
    }

    placeholders.push(...annotate('Root', 'root'))

    if (manifest.hasCoreModule('modifiers') || manifest.hasModifiers) {
      placeholders.push(...annotate('Global Modifiers', 'modifiers'))
    }

    if (manifest.hasCoreModule('constraints')) {
      placeholders.push(...annotate('Constraints', 'constraints'))
    }

    if (manifest.hasComponents) {
      placeholders.push(...annotate('Element/Component Resets', 'componentResets'))
      placeholders.push(...annotate('Components', 'components'))
    }

    if (!CONFIG.typography.disabled || !CONFIG.layout.disabled) {
      placeholders.push(...annotate(`${!CONFIG.typography.disabled ? 'Typography' : ''}${!CONFIG.typography.disabled && !CONFIG.layout.disabled ? ' / ' : ''}${!CONFIG.layout.disabled ? 'Layout' : ''}`, 'typography'))
    }

    root.prepend([
      ...placeholders,
      CSSUtils.createComment('Custom Styles ************************************************************')
    ])

    resolve(root)
  })
})
