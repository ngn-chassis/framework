import QueueUtils from '../../utilities/QueueUtils.js'

import FileImport from '../../atrules/import/FileImport.js'
import ModuleImport from '../../atrules/import/ModuleImport.js'

import Component from '../../atrules/component/Component.js'

export default class TreeStore {
  #root = null
  #tree = null

  #modules = []
  #themes = []
  #versions = []
  #components = []

  get components () {
    return this.#components
  }

  get themes () {
    return this.#themes
  }

  get tree () {
    return this.#tree
  }

  get versions () {
    return this.#versions
  }

  resolve (root, resolve, reject) {
    this.#root = root

    this.#resolveImports([], this.#root, (err, children) => {
      if (err) {
        return reject(err)
      }

      this.#tree = {
        stylesheet: this.#root,
        children
      }

      resolve()
    })
  }

  #resolveFileImport = (chain, rule, cb) => {
    let imp = new FileImport(rule)

    imp.load((err, stylesheets) => {
      if (err) {
        return cb(err)
      }

      stylesheets.forEach(stylesheet => {
        if (chain.includes(stylesheet.filepath)) {
          return cb(rule.error(`\nCircular Dependency`))
        }
      })

      cb(null, stylesheets)
    })
  }

  #resolveModuleImport = (chain, rule, cb) => {
    rule.remove()
    cb()
    // let imp = new ModuleImport(rule)

    // imp.modules.forEach((module, i) => {
    //
    // })

    // if (!imp.modules.every((module, i) => this.#tree.modules.has(module))) {
    //   console.log('ALREADY GOT IT');
    //   imp.modules.splice()
    //   return cb()
    // }
    //
    // imp.load((err, modules) => {
    //   if (err) {
    //     return cb(err)
    //   }
    //
    //
    //
    //   this.#tree.modules = Object.assign(this.#tree.modules, modules)
    //
    //   // cb(null, stylesheet)
    // })
  }

  #resolveImport = (chain, imp, cb) => {
    let { type } = imp
    let id = NGN.DATA.util.GUID()

    switch (type) {
      case 'file': return this.#resolveFileImport(chain, imp, cb)
      case 'module': return this.#resolveModuleImport(chain, imp, cb)
      default: return cb(imp.error(`\nInvalid import`))
    }
  }

  #resolveImports = (chain, stylesheet, cb) => {
    let output = []

    if (stylesheet.imports.length === 0) {
      return cb()
    }

    chain.push(stylesheet.filepath)

    QueueUtils.queue({
      pad: {
        start: '    '
      },

      tasks: stylesheet.imports.map(imp => ({
        name: `Importing ${imp.params}${stylesheet.filepath ? ` into ${stylesheet.filepath}` : ''}`,

        callback: next => this.#resolveImport(chain, imp, (err, stylesheets) => {
          if (err) {
            return cb(err)
          }

          QueueUtils.queue({
            log: false,

            tasks: stylesheets.map(child => ({
              name: `Resolving Child Import`,
              callback: next => this.#resolveImports(chain, child, (err, children) => {
                if (err) {
                  return cb(err)
                }

                try {
                  this.#components.push(...this.#processComponents(child.components))
                  this.#themes.push(...child.themes)
                  this.#versions.push(...child.versions)

                  output.push({
                    imp,
                    stylesheet: child,
                    children
                  })

                  next()
                } catch (err) {
                  cb(err)
                }
              })
            }))
          }).then(() => {
            output.forEach(({ imp, stylesheet }) => imp.replaceWith(stylesheet.clone()))
            next()
          }).catch(cb)
        })
      }))
    }).then(() => {
      chain.pop()
      cb(null, output.length === 0 ? null : output)
    }).catch(cb)
  }

  #processComponents = rules => rules.map(rule => {
    let component = new Component(rule)
    rule.remove()
    return component
  })
}
