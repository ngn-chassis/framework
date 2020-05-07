import postcss from 'postcss'
import AtRules from '../AtRules.js'

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
  'media',
  'mixin',
  'new',
  'not',
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
  'not'
]

function processAtRules (type, atrules, stylesheet, resolve, reject) {
  let process = AtRules[type]

  if (!process) {
    return reject(new Error(`DEVELOPER ERROR. Invalid at-rule type "${type}"`))
  }

  let queue = new NGN.Tasks()

  queue.on('complete', resolve)

  atrules.forEach(atrule => {
    queue.add(`Processing "${type}" at-rule`, next => {
      process({ stylesheet, atrule }, next, reject)
    })
  })

  queue.run(true)
}

export default postcss.plugin('resolve-atrules', stylesheet => {
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

    let queue = new NGN.Tasks()

    queue.on('complete', () => resolve(root))

    Reflect.ownKeys(atrules).forEach(type => {
      queue.add('Processing At-Rule', next => {
        processAtRules(type, atrules[type], stylesheet, next, reject)
      })
    })

    queue.run(true)
  })
})
