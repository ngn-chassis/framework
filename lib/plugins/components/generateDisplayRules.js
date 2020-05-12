import CSSUtils from '../../utilities/CSSUtils.js'

export default function generateDisplayRules (displayRules, cb) {
  let root = CSSUtils.createRoot()

  displayRules.forEach(rule => {
    console.log(rule.args)
    console.log(rule.remainingArgs)
    console.log('----------------');
  })

  cb(null, root)
}
