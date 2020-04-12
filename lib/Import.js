import fs from 'fs-extra'
import path from 'path'
import glob from 'glob'
import postcss from 'postcss'

import Imports from './Imports.js'
import StyleSheet from './StyleSheet.js'
import Config from './data/Config.js'
import AtRule from './AtRule.js'
import CSSUtils from './utilities/CSSUtils.js'
import ErrorUtils from './utilities/ErrorUtils.js'
import FileUtils from './utilities/FileUtils.js'

export default class Import extends AtRule {
  from = 'chassis'
  modules = null

  constructor (parent, atRule) {
    super(atRule)

    this.parent = parent

    let arg1 = this.args[0]
    let err = new Error('Import does not specify any modules')

    if (!arg1) {
      throw err
    }

    this.type = this.args[0].type === 'string' ? 'file' : 'module'

    if (this.type === 'file') {
      return
    }

    this.modules = arg1.type === 'word'
      ? [arg1.value]
      : arg1.type === 'function'
        ? arg1.nodes.reduce((modules, node) => {
          if (node.type !== 'word') {
            return modules
          }

          return [...modules, node.value]
        }, [])
        : null

    if (!this.modules) {
      throw err
    }

    let arg2 = this.args[1]

    if (arg2) {
      this.from = arg2.type === 'word' && arg2.value === 'from' ? this.args[2].value : null
    }
  }

  resolve (cb) {
    switch (this.type) {
      case 'file': return this.#resolveFileImport(cb)
      case 'module': return this.#resolveModuleImport(cb)
    }
  }

  // TODO: Handle remote imports
  #resolveFileImport = cb => {
    let filepath = path.join(path.dirname(this.source.file), this.args[0].value)

    glob(filepath, {}, (err, files) => {
      if (err) {
        return cb(err)
      }

      let queue = new NGN.Tasks()

      queue.on('complete', cb)

      files.forEach((file, index) => {
        if (!this.parent.canImport(file)) {
          return cb(ErrorUtils.createError(Object.assign({}, this.source, {
            css: this.root.toString(),
            message: `Circular import`
          })))
        }

        queue.add(`Processing import ${file}`, next => {
          let ext = FileUtils.getFileExtension(file)

          if (ext !== '.css') {
            return cb(ErrorUtils.createError(Object.assign({}, this.source, {
              css: this.root.toString(),
              message: `Invalid file extension "${ext}"`
            })))
          }

          if (!FileUtils.fileExists(file)) {
            return cb(ErrorUtils.createError(Object.assign({}, this.source, {
              css: this.root.toString(),
              message: `${file} not found`
            })))
          }

          // Recursively handle nested imports
          let stylesheet = new StyleSheet(file, this.parent)

          stylesheet.resolveImports(err => {
            if (err) {
              return cb(err)
            }
            
            this.root.replaceWith(stylesheet.ast)
            next()
          })
        })
      })

      queue.run(true)
    })
  }

  #resolveModuleImport = cb => {
    let queue = new NGN.Tasks()
    let root = CSSUtils.createRoot([])

    queue.on('complete', () => {
      this.root.replaceWith(root)
      cb()
    })

    this.modules.forEach(module => {
      queue.add(`Importing ${module}`, async (next) => {
        let imported = await Imports[module](this.args.slice(1), err => {
          if (err) {
            return cb(ErrorUtils.createError(Object.assign({}, this.source, {
              css: this.root.toString(),
              message: err
            })))
          }
        })

        let output = postcss.parse(imported)
        output.source.input.id = `chassis ${module}`

        root.append(output)
        next()
      })
    })

    queue.run(true)
  }
}
