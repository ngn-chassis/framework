import postcss from 'postcss'
import Config from '../data/Config.js'
import Import from '../Import.js'
import TypographyUtils from '../utilities/TypographyUtils.js'

function getChain (rule) {
  let { parent } = rule

  if (!parent || parent.type === 'root') {
    return []
  }

  return [parent, ...getChain(parent)]
}

function trimSelector (selector) {
  return selector.replace(/&/g, '')
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

export default postcss.plugin('imports', styleSheet => root => new Promise((resolve, reject) => {
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
      let imp = new Import(styleSheet, atRule)

      imp.resolve(err => {
        if (err) {
          return reject(err)
        }

        styleSheet.imports.push(imp)
        next()
      })
    })
  })

  queue.run(true)
}))
