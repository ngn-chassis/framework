import postcss from 'postcss'

export default postcss.plugin('imports', imports => root => new Promise((resolve, reject) => {
  if (imports.length === 0) {
    return resolve(root)
  }

  let queue = new NGN.Tasks()

  queue.on('complete', () => resolve(root))

  imports.forEach(imp => {
    queue.add('Processing import', next => {
      imp.resolve((err, output) => {
        if (err) {
          return reject(err)
        }

        next()
      })
    })
  })

  queue.run(true)
}))
