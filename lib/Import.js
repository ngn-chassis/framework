import fs from 'fs-extra'
import path from 'path'
import glob from 'glob'
import postcss from 'postcss'

import StyleSheet from './StyleSheet.js'
import Config from './data/Config.js'
import AtRule from './AtRule.js'
import CSSUtils from './utilities/CSSUtils.js'
import ErrorUtils from './utilities/ErrorUtils.js'
import FileUtils from './utilities/FileUtils.js'

import generateCore from './modules/core.js'
import components from './modules/components.js'

export default class Import extends AtRule {
  from = 'chassis'

  constructor (parent, atRule) {
    super(atRule)

    this.parent = parent
    this.type = this.args[0].type === 'string' ? 'file' : 'module'
    this.module = this.args[0].value

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
          let styleSheet = new StyleSheet(file, this.parent)

          styleSheet.resolveImports(err => {
            if (err) {
              return cb(err)
            }

            this.root.replaceWith(styleSheet.ast)
            next()
          })
        })
      })

      queue.run(true)
    })
  }

  #resolveModuleImport = cb => {
    let output = ''
    let id = 'chassis'

    switch (this.module) {
      case 'core':
        output = generateCore()
        id += ' core'
        break

      case 'components':
        output = components
        id += ' components'
        break

      default: return cb(ErrorUtils.createError(Object.assign({}, this.source, {
        css: this.root.toString(),
        message: `Unrecognized module "${this.module}"`
      })))
    }

    output = postcss.parse(output)
    output.source.input.id = id

    this.root.replaceWith(output)

    cb()
  }
}
