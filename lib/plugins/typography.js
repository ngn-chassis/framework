import postcss from 'postcss'
import { CONFIG } from '../../index.js'
import ApplyRule from '../atrules/apply/ApplyRule.js'
import Application from '../atrules/apply/Application.js'

export default postcss.plugin('chassis-typography', annotations => {
  return (root, result) => new Promise((resolve, reject) => {
    if (!annotations.hasOwnProperty('typography')) {
      return resolve(root)
    }

    let applications = []

    root.walkAtRules('apply', atrule => {
      let applyRule = new ApplyRule(atrule)
      applications.push(new Application(applyRule))
      atrule.remove()
    })

    // applications.forEach(application => {
    //   console.log('BOUNDS: ', application.bounds);
    //   console.log(`MARGIN: `, application.margin?.properties ?? null)
    //   console.log(`PADDING: `, application.padding?.properties ?? null)
    //   console.log(`TYPESET: `, application.typeset?.size ?? null, application.typeset?.relative ?? null)
    //   console.log('----------');
    // })

    let { viewports } = CONFIG
    // console.log(viewports)

    resolve(root)
  })
})
