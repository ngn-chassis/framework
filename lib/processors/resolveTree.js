import postcss from 'postcss'
import Placeholder from '../atrules/Placeholder.js'
import CoreModule from '../modules/CoreModule.js'

function resolvePlaceholders (stylesheet, root, cb) {
  let queue = new NGN.Tasks()

  queue.on('complete', cb)

  root.walkAtRules('placeholder', atrule => {
    queue.add(`Resolving Placeholder`, next => {
      resolvePlaceholder(stylesheet, atrule, next, cb)
    })
  })

  queue.run(true)
}

function resolvePlaceholder (stylesheet, atrule, accept, reject) {
  let placeholder = new Placeholder(atrule)

  placeholder.validate(err => {
    if (err) {
      return reject(err)
    }

    let stored = stylesheet.placeholders[placeholder.id]
    let queue = new NGN.Tasks()

    queue.on('complete', accept)

    if (stored.hasPlaceholders) {
      queue.add(`Resolving Child Placeholders`, next => {
        resolvePlaceholders(stored, stored.root, err => {
          if (err) {
            return reject(err)
          }
          next()
        })
      })
    }

    queue.add(`Resolving Placeholder`, next => {
      atrule.replaceWith(stored.resolve())
      next()
    })

    queue.run(true)
  })
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
