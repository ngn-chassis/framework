import postcss from 'postcss'
import Placeholder from '../atrules/Placeholder.js'

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

function resolvePlaceholder (stylesheet, atrule, resolve, reject) {
  let placeholder = new Placeholder(atrule)

  placeholder.validate(err => {
    if (err) {
      return reject(err)
    }

    let stored = stylesheet.placeholders[placeholder.id]
    let queue = new NGN.Tasks()

    queue.on('complete', resolve)

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
    resolvePlaceholders(stylesheet, root, err => {
      if (err) {
        return reject(err)
      }

      resolve(root)
    })
  })
})
