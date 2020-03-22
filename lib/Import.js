const path = require('path')
const glob = require('glob')

const Config = require('./data/Config.js')
const AtRule = require('./AtRule.js')
const CSSUtils = require('./utilities/CSSUtils.js')
const ErrorUtils = require('./utilities/ErrorUtils.js')
const FileUtils = require('./utilities/FileUtils.js')

module.exports = class Import extends AtRule {
  #StyleSheetConstructor

  constructor (atRule, StyleSheet) {
    super(...arguments)
    this.type = this.args[0].type === 'string' ? 'file' : 'module'
    this.#StyleSheetConstructor = StyleSheet
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

      let newRoot = CSSUtils.createRoot([])

      files.filter(file => file !== this.source.file).forEach((file, index) => {
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

        // let styleSheet = new this.#StyleSheetConstructor(file)
        // console.log(styleSheet.ast.toString());
        // newRoot.append(FileUtils.parseStyleSheet(file))
      })

      // newRoot.source = this.root.source
      // this.root.replaceWith(newRoot)

      cb()
    })
  }

  #resolveModuleImport = () => {
    console.log('mod')
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
