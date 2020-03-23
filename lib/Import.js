import path from 'path'
import glob from 'glob'
import postcss from 'postcss'

import StyleSheet from './StyleSheet.js'
import Config from './data/Config.js'
import AtRule from './AtRule.js'
import CSSUtils from './utilities/CSSUtils.js'
import ErrorUtils from './utilities/ErrorUtils.js'
import FileUtils from './utilities/FileUtils.js'

import chassis from './modules/chassis.js'

export default class Import extends AtRule {
  #path
  // #StyleSheetConstructor

  constructor (atRule, dir) {
    super(atRule)

    this.type = this.args[0].type === 'string' ? 'file' : 'module'
    this.module = this.args[0].value

    let arg2 = this.args[1]

    if (arg2) {
      this.from = arg2.type === 'word' && arg2.value === 'from' ? this.args[2].value : null
    } else if (this.type === 'module') {
      this.from = 'chassis'
    }
  }

  resolve (cb) {
    switch (this.type) {
      case 'file': return this.#resolveFileImport(cb)
      case 'module': return this.#resolveModuleImport(cb)
    }
  }

  #resolveFileImport = cb => {
    let filepath = path.join(path.dirname(this.source.file), this.args[0].value)

    glob(filepath, {}, (err, files) => {
      if (err) {
        return cb(err)
      }

      let queue = new NGN.Tasks()

      queue.on('complete', cb)

      files.filter(file => file !== this.source.file).forEach((file, index) => {
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

          this.root.replaceWith(FileUtils.parseStyleSheet(file))

          next()
        })
      })

      queue.run(true)
    })
  }

  #resolveModuleImport = cb => {
    let output = ''

    switch (this.module) {
      case 'core':
        output = chassis.core
        break

      case 'components':
        output = chassis.components
        break

      default: return cb(ErrorUtils.createError(Object.assign({}, this.source, {
        css: this.root.toString(),
        message: `Unrecognized import module "${this.module}"`
      })))
    }

    output = postcss.parse(output)
    output.source.input.id = output.source.input.id.replace('input css', 'chassis')

    this.root.replaceWith(output)
    cb()
  }

  // #getModulePath = () => {
  //   let from = this.args[this.args.length - 1]
  //
  //   if (from.type === 'string') {
  //     return from.value
  //   }
  //
  //   if (from.type !== 'word') {
  //     return null
  //   }
  //
  //   switch (from.value) {
  //     case 'chassis.components': return FileUtils.resolve('./components')
  //     default: return null
  //   }
  // }
}
