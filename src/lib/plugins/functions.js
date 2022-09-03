import postcss from 'postcss'
import functions from 'postcss-functions'
import { CONFIG } from '../../index.js'
import parseValue from 'postcss-value-parser'
import SelectorUtils from '../utilities/SelectorUtils.js'
import MediaQueryRule from '../atrules/media/MediaQueryRule.js'
import TypographyEngine from '../TypographyEngine.js'

const FUNCTION_NAMES = [
  'fs',
  // 'fontsize',
  // 'fontSize',
  // 'getFontSize',
  'lh',
  // 'lineheight',
  // 'lineHeight',
  // 'getLineHeight',
  'padding',
  'margin'
]

function getBounds (node) {
  if (node.type === 'atrule' && node.name === 'media') {
    const query = new MediaQueryRule(node)
    const { min, max } = query.width
    return (!!min || !!max) ? query.width : null
  }

  return null
}

const declMap = ['top', 'right', 'bottom', 'left']

function isTypographyFunction (node) {
  return node.type === 'function' && FUNCTION_NAMES.includes(node.value)
}

export default postcss.plugin('chassis-functions', typography => {
  return (root, result) => new Promise((resolve, reject) => {
    function storeSettings (decl) {
      if (!['margin', 'padding', 'font'].includes(decl.prop)) {
        return isTypographyFunction(args[0]) ? typography.addSetting(decl.prop, ) : null
      }

      const args = parseValue(decl.value).nodes.filter(node => node.type !== 'space')

      if (args.length === 1 && isTypographyFunction(args[0])) {
        return declMap.forEach(position => {
          console.log('HANDLE', `${decl.prop}-${position}`)
        })
      }

      if (args.length === 2) {
        return args.forEach((arg, index) => {
          if (isTypographyFunction(arg)) {
            console.log('HANDLE', `${decl.prop}-${declMap[index]}`)
            console.log('HANDLE', `${decl.prop}-${declMap[index + 2]}`)
          }
        })
      }

      if (args.length === 3) {
        return args.forEach((arg, index) => {
          if (!isTypographyFunction(arg)) {
            return
          }

          if (index === 1) {
            console.log('HANDLE', `${decl.prop}-${declMap[index]}`)
            return console.log('HANDLE', `${decl.prop}-${declMap[index + 2]}`)
          }

          console.log('HANDLE', `${decl.prop}-${declMap[index]}`)
        })
      }

      args.forEach((arg, index) => {
        if (!isTypographyFunction(arg)) {
          return
        }

        console.log('HANDLE', `${decl.prop}-${declMap[index]}`)
      })
    
      // const bounds = getBounds(decl.parent.parent)
      // typography.addSetting(new SetRule(atrule))
    }

    ;['...full list'].forEach(property => {
      root.walkDecls(property, decl => {
        // 
      })
    })

    // root.walkDecls(/^margin/, storeSettings)
    // root.walkDecls(/^padding/, storeSettings)
    // root.walkDecls(/^font/, storeSettings)
    
    const processRemaining = functions({
      functions: CONFIG.functions
    })

    processRemaining(root, { from: undefined })
    resolve(root)
  })
})

