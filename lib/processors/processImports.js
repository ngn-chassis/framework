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

function getAtRuleProps (atRule) {
  let { parent } = atRule

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
    fontSize: TypographyUtils.getFontSize(atRule.params)
  }
}

export default postcss.plugin('imports', stylesheet => (root, result) => new Promise((resolve, reject) => {
  let queue = new NGN.Tasks()

  queue.on('complete', () => resolve(root))

  queue.add(`Registering @typeset rules`, next => {
    root.walkAtRules('typeset', atRule => {
      Config.typesetRules.push(getAtRuleProps(atRule))
    })

    next()
  })

  root.walkAtRules('import', atRule => {
    queue.add(`Processing import`, next => {
      let imp

      let err = {
        file: result.root.source.input.file,
        line: atRule.source.start.line,
        column: atRule.source.start.column,
        css: atRule.toString()
      }

      try {
        imp = new Import(stylesheet, atRule)
      } catch (e) {
        return reject(ErrorUtils.createError(Object.assign({}, err, {
          message: [e.message]
        })))
      }

      if (imp.type === 'module') {
        imp.modules.forEach(module => {
          if (!Imports.hasOwnProperty(module)) {
            return reject(ErrorUtils.createError(Object.assign({}, err, {
              message: [
                ...err.message,
                '',
                'Valid modules include:',
                ...Reflect.ownKeys(Imports).filter(key => typeof Imports[key] === 'function').map(key => `  ${key}`)
              ]
            })))
          }
        })
      }

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
