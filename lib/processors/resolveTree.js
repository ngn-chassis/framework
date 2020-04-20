import postcss from 'postcss'
import Placeholder from '../atrules/Placeholder.js'
import CoreModule from '../modules/CoreModule.js'

function callback (err, accept, reject) {
  if (err) {
    return reject(err)
  }

  accept()
}

function resolvePlaceholders (stylesheet, root, cb) {
  let queue = new NGN.Tasks()

  queue.on('complete', cb)

  root.walkAtRules('placeholder', atrule => {
    queue.add(`Resolving Placeholder`, next => {
      let placeholder = new Placeholder(atrule)

      placeholder.validate(err => {
        if (err) {
          return reject(err)
        }

        let stored = stylesheet.placeholders[placeholder.id]

        if (!stored.hasPlaceholders) {
          atrule.replaceWith(stored.root.clone())
          return next()
        }

        resolvePlaceholders(stored, stored.root, err => {
          atrule.replaceWith(stored.root.clone())
          next()
        })
      })
    })
  })

  queue.run()
}

export default postcss.plugin('chassis-resolve-tree', (stylesheet, theme) => {
  return (root, result) => new Promise((resolve, reject) => {
    let queue = new NGN.Tasks()

    queue.on('complete', () => resolve(root))

    queue.add('Resolving Tree', next => {
      resolvePlaceholders(stylesheet, root, err => {
        if (err) {
          return reject(err)
        }

        next()
      })
    })

    queue.add(`Importing Chassis Core`, next => {
      CoreModule.render(stylesheet, theme, (err, css) => {
        if (err) {
          return reject(err)
        }

        root.prepend(css)
        next()
      })
    })

    queue.run(true)
  })
})
