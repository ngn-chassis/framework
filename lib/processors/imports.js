const postcss = require('postcss')

module.exports = postcss.plugin('imports', (cfg, imports) => root => new Promise((resolve, reject) => {
  if (imports.length === 0) {
    return resolve(root)
  }

  let queue = new NGN.Tasks()

  queue.on('complete', () => resolve(root))

  imports.forEach(imp => {
    queue.add('Processing import', next => {
      imp.resolve(err => {
        if (err) {
          return reject(err)
        }

        next()
      })
    })
  })

  queue.run(true)
}))
