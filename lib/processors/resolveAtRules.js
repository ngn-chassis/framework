import postcss from 'postcss'

import ExtendsRule from '../atrules/ExtendsRule.js'
import ComponentRule from '../atrules/component/ComponentRule.js'
import ExtensionComponent from '../atrules/component/ExtensionComponent.js'

import CSSUtils from '../utilities/CSSUtils.js'
import SelectorUtils from '../utilities/SelectorUtils.js'

function processExtends (stylesheet, atrules, resolve, reject) {
  let { components } = stylesheet
  let queue = new NGN.Tasks()

  queue.on('complete', resolve)

  atrules.forEach(atrule => {
    queue.add('Processing @extends', next => {
      let ext = new ExtendsRule(atrule)

      ext.validate(err => {
        if (err) {
          return reject(err)
        }

        let component = new ComponentRule(CSSUtils.createAtRule({
          name: 'component',
          params: `${ext.name} extends ${ext.extends}`,
          nodes: ext.nodes
        }))

        component.validate(components, err => {
          if (err) {
            return reject(err)
          }

          let parent = components.find(component => component.name === ext.extends)

          if (!parent) {
            return reject(ext.error(`\nCannot extend non-existent component "${ext.extends}"`, { word: ext.extends }))
          }

          ext = new ExtensionComponent(parent, component, true)
          parent.addExtension(ext)
          stylesheet.components.push(ext)

          SelectorUtils.resolveSelector(atrule.parent, (err, selector) => {
            ext.selector = selector
            
            let root = CSSUtils.createRoot(ext.styles)

            ext.resolveStates(root, (err, result) => {
              if (err) {
                return reject(err)
              }

              atrule.replaceWith(result.toString())
              next()
            })
          })
        })
      })
    })
  })

  queue.run(true)
}

export default postcss.plugin('resolve-atrules', stylesheet => {
  return (root, result) => new Promise((resolve, reject) => {
    let atrules = {}

    root.walkAtRules(atrule => {
      if (!atrules.hasOwnProperty(atrule.name)) {
        atrules[atrule.name] = [atrule]
        return
      }

      atrules[atrule.name].push(atrule)
    })

    let queue = new NGN.Tasks()

    queue.on('complete', () => resolve(root))

    if (atrules.hasOwnProperty('extends')) {
      queue.add('Processing @extends at-rules', next => {
        processExtends(stylesheet, atrules.extends, next, reject)
      })
    }

    queue.run(true)
  })
})
