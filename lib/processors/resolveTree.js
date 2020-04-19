import postcss from 'postcss'
import CoreModule from '../modules/CoreModule.js'

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

  queue.add('Resolving', next => imp.resolve(err => callback(err, next, cb)))
  queue.run(true)
}

export default postcss.plugin('chassis-resolve-tree', (stylesheet, theme) => {
  return (root, result) => new Promise((resolve, reject) => {
    let queue = new NGN.Tasks()

    queue.on('complete', () => resolve(root))

    queue.add(`Importing Chassis Core`, next => {
      CoreModule.render(stylesheet, theme, (err, css) => {
        if (err) {
          return reject(err)
        }

        stylesheet.prepend(css)
        next()
      })
    })

    queue.add('Resolving Imports', next => {
      processImports(stylesheet, err => callback(err, next, reject))
    })

    queue.run(true)
  })
})
