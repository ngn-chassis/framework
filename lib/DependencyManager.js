import QueueUtils from './utilities/QueueUtils.js'

import FileImport from './atrules/import/FileImport.js'
import ModuleImport from './atrules/import/ModuleImport.js'

import Component from './atrules/component/Component.js'
import ComponentExtension from './atrules/component/ComponentExtension.js'

export default class Tree {
  #root = null
  #tree = null

  modules = {}
  themes = []
  versions = []
  #components = []
  #extensions = []

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

      this.#registerComponents(resolve, reject)
    })
  }

  #registerComponent = rule => {
    this.#components.push(new Component(rule))
    rule.remove()
  }

  #registerComponents = (resolve, reject) => {
    Object.keys(this.modules.components).forEach(name => {
      this.#registerComponent(this.modules.components[name])
    })

    this.#root.components.forEach(rule => this.#registerComponent(rule))

    this.components = this.#components.reduce((components, component) => {
      if (component.isExtension) {
        let parent = this.#components.find(stored => stored.name === component.superclass)

        if (!parent) {
          return reject(component.error(`\nCannot extend non-existent component "${component.superclass}"`, { word: component.superclass }))
        }

        // this.#addExtensions(component)
        parent.addExtension(component)
        return components
      }

      components[component.name] = component
      return components
    }, {})

    resolve()
  }

  #resolveFileImport = (chain, rule, cb) => {
    let imp = new FileImport(rule)

    imp.resolve((err, stylesheets) => {
      if (err) {
        return cb(err)
      }

      stylesheets.forEach(stylesheet => {
        if (chain.includes(stylesheet.filepath)) {
          return cb(rule.error(`\nCircular Dependency\n${chain.join('\n--> ')}\n--> ${stylesheet.filepath}`))
        }
      })

      let output = []

      QueueUtils.run({
        log: false,

        tasks: stylesheets.map(child => ({
          name: `Resolving Child Import`,
          callback: next => this.#resolveImports(chain, child, (err, children) => {
            if (err) {
              return cb(err)
            }

            child.components.forEach(rule => this.#registerComponent(rule))
            // this.themes.push(...child.themes)
            // this.versions.push(...child.versions)

            output.push({
              imp,
              stylesheet: child,
              children
            })

            next()
          })
        }))
      }).then(() => {
        output.forEach(({ imp, stylesheet }) => imp.replaceWith(stylesheet.clone()))
        cb()
      }).catch(cb)
    })
  }

  #resolveModuleImport = (rule, cb) => {
    let imp = new ModuleImport(rule)

    imp.resolve((err, funcs) => {
      if (err) {
        return cb(err)
      }

      this.modules = Object.assign(this.modules, { [imp.source]: funcs })
      rule.remove()
      cb()
    })
  }

  #resolveImport = (chain, imp, cb) => {
    let { type } = imp
    let id = NGN.DATA.util.GUID()

    switch (type) {
      case 'file': return this.#resolveFileImport(chain, imp, cb)
      case 'module': return this.#resolveModuleImport(imp, cb)
      default: return cb(imp.error(`\nInvalid import`))
    }
  }

  #resolveImports = (chain, stylesheet, cb) => {
    let output = []

    if (stylesheet.imports.length === 0) {
      return cb()
    }

    chain.push(stylesheet.filepath)

    QueueUtils.run({
      pad: {
        start: '    '
      },

      tasks: stylesheet.imports.map(imp => ({
        name: `Importing ${imp.params}${stylesheet.filepath ? ` into ${stylesheet.filepath}` : ''}`,

        callback: next => this.#resolveImport(chain, imp, err => {
          if (err) {
            return cb(err)
          }

          next()
        })
      }))
    }).then(() => {
      chain.pop()
      cb(null, output.length === 0 ? null : output)
    }).catch(cb)
  }
}
