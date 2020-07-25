import postcss from 'postcss'

import apply from '../atrules/apply/processor.js'
import extend from '../atrules/extend/processor.js'
import implement from '../atrules/new/processor.js'
// import media from '../atrules/media/processor.js'

import MediaQuery from '../atrules/media/MediaQuery.js'

import CSSUtils from '../utilities/CSSUtils.js'
import QueueUtils from '../utilities/QueueUtils.js'

const native = [
  'charset',
  'custom-media',
  'namespace',
  'media',
  'supports',
  'document',
  'import',
  'page',
  'font-face',
  'keyframes',
  'viewport',
  'counter-style',
  'font-feature-values',
  'swash',
  'ornaments',
  'annotation',
  'stylistic',
  'styleset',
  'character-variant',
  'viewport'
]

const chassis = [
  'apply',
  'component',
  'config',
  'constrain',
  'export',
  'extend',
  'font-size',
  'import',
  'line-height',
  'make',
  'margin',
  'media',
  'mixin',
  'new',
  'not',
  'padding',
  'reset',
  'selector',
  'state',
  'theme',
  'typeset',
  'unset',
  'z-index'
]

const children = [
  'state',
  'property',
  'reset',
  'unset',
  'not',
  'typeset',
  'margin',
  'padding',
  'font-size',
  'line-height',
  'selector',
  'state'
]

const mediaQueries = []

class AtRules {
  static apply () {
    return apply.process(...arguments)
  }

  static constrain (data, resolve, reject) {
    // console.log('call constrain')
    // console.log(data)
  }

  static media ({ atrule, stylesheet }, resolve, reject) {
    mediaQueries.push(atrule)
    resolve()
  }

  static extend () {
    return extend.process(...arguments)
  }

  static new () {
    return implement.process(...arguments)
  }
}

function processAtRules (type, atrules, stylesheet, theme, resolve, reject) {
  let process = AtRules[type]

  if (!process) {
    return reject(new Error(`DEVELOPER ERROR. Invalid at-rule type "${type}"`))
  }

  QueueUtils.run({
    log: false,

    tasks: atrules.map(atrule => ({
      name: `Processing "${type}" at-rule`,
      callback: next => process({ stylesheet, atrule, theme }, next, reject)
    }))
  })
  .then(resolve)
  .catch(reject)
}

export default postcss.plugin('resolve-atrules', (stylesheet, theme) => {
  return (root, result) => new Promise((resolve, reject) => {
    let atrules = {}

    root.walkAtRules(atrule => {
      let isNative = native.includes(atrule.name)
      let isProprietary = chassis.includes(atrule.name)

      if (atrule.name === 'import') {
        stylesheet.hoist(atrule)
        return atrule.remove()
      }

      if (isProprietary) {
        if (children.includes(atrule.name)) {
          return
        }

        if (atrules.hasOwnProperty(atrule.name)) {
          return atrules[atrule.name].push(atrule)
        }

        atrules[atrule.name] = [atrule]
        return
      }

      if (!isNative) {
        return reject(atrule.error(`\nInvalid at-rule "@${atrule.name}"`))
      }
    })

    QueueUtils.run({
      log: false,

      tasks: [
        ...Reflect.ownKeys(atrules).map(type => ({
          name: 'Processing At-Rule',
          callback: next => processAtRules(type, atrules[type], stylesheet, theme, next, reject)
        })),

        {
          name: 'Process Media Queries',
          callback: next => {
            mediaQueries.forEach(atrule => {
              let query = new MediaQuery(atrule)
              let { parent } = atrule

              let replacement = CSSUtils.createAtRule({
                name: 'media',
                params: query.params,
                nodes: atrule.nodes
              })

              atrule.replaceWith(replacement)
              replacement.parent = parent
            })

            next()
          }
        }
      ]
    })
    .then(() => resolve(root))
    .catch(reject)
  })
})
