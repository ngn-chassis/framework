import postcss from 'postcss'

function callback (err, accept, reject) {
  if (err) {
    return reject(err)
  }

  accept()
}

function processImports (stylesheet, cb) {
  let queue = new NGN.Tasks()

  queue.on('complete', cb)

  stylesheet.imports.forEach(imp => {
    queue.add(`Resolving Imports`, next => processImport(imp, err => callback(err, next, cb)))
  })

  queue.run(true)
}

function processImport (imp, cb) {
  let queue = new NGN.Tasks()

  queue.on('complete', cb)

  if (imp.hasImports) {
    queue.add(`Processing child imports`, next => {
      imp.imports.forEach(stylesheet => processImports(stylesheet, err => callback(err, next, cb)))
    })
  }

  queue.add('Resolving', next => {
    imp.resolve(err => callback(err, next, cb))
  })

  queue.run(true)
}

export default postcss.plugin('chassis-resolve-tree', (stylesheet, theme) => {
  return (root, result) => new Promise((resolve, reject) => {
    processImports(stylesheet, err => callback(err, resolve, reject))
  })
})
