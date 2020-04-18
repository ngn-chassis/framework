import postcss from 'postcss'

import Config from '../data/Config.js'
import Imports from '../Imports.js'
import Import from '../Import.js'

import ErrorUtils from '../utilities/ErrorUtils.js'
import SelectorUtils from '../utilities/SelectorUtils.js'
import TypographyUtils from '../utilities/TypographyUtils.js'

function getChain (rule) {
  let { parent } = rule

  if (!parent || parent.type === 'root') {
    return []
  }

  return [parent, ...getChain(parent)]
}

function trimSelector (selector) {
  return SelectorUtils.clean(selector)
}

function getAtRuleProps (atrule) {
  let { parent } = atrule

  let query = parent
    ? (parent.type === 'atrule' && parent.name === 'media')
      ? parent
      : null
    : null

  let chain = [parent, ...getChain(parent)]

  let selector = chain.reduce((selector, rule) => {
    if (!rule) {
      return selector
    }

    if (rule.type === 'atrule' && rule.name === 'media') {
      query = rule
      return selector
    }

    return `${rule.selector}${selector}`
  }, '')

  let min
  let max

  if (query) {
    console.log('FIND QUERY BOUNDS');
  }

  return {
    min: null,
    max: null,
    selector: trimSelector(selector),
    fontSize: TypographyUtils.getFontSize(atrule.params)
  }
}

export default postcss.plugin('imports', stylesheet => (root, result) => new Promise((resolve, reject) => {
  let queue = new NGN.Tasks()

  queue.on('complete', () => resolve(root))

  queue.add(`Registering @typeset rules`, next => {
    root.walkAtRules('typeset', atrule => {
      Config.typesetRules.push(getAtRuleProps(atrule))
    })

    next()
  })

  root.walkAtRules('import', atrule => {
    queue.add(`Processing import`, next => {
      let imp, err = {
        file: result.root.source.input.file,
        line: atrule.source.start.line,
        column: atrule.source.start.column,
        css: atrule.toString()
      }

      try {
        imp = new Import(stylesheet, atrule)
      } catch (e) {
        return reject(ErrorUtils.createError(Object.assign({}, err, {
          message: [e.message]
        })))
      }

      if (imp.type !== 'module') {
        return next()
      }

      imp.modules.forEach(module => {
        if (!Imports.hasOwnProperty(module)) {
          return reject(ErrorUtils.createError(Object.assign({}, err, {
            message: [
              `Unknown module "${module}"`,
              '',
              'Valid modules include:',
              ...Reflect.ownKeys(Imports).filter(key => typeof Imports[key] === 'function').map(key => `  ${key}`)
            ]
          })))
        }
      })

      imp.resolve(err => {
        if (err) {
          return reject(err)
        }

        stylesheet.imports.push(imp)
        next()
      })
    })
  })

  queue.run(true)
}))
