import postcss from 'postcss'
import Import from '../Import.js'

export default postcss.plugin('imports', styleSheet => root => new Promise((resolve, reject) => {
  let queue = new NGN.Tasks()

  queue.on('complete', () => resolve(root))

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
