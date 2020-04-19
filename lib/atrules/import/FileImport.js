import path from 'path'
import glob from 'glob'

import Resource from './Resource.js'
import CSSUtils from '../../utilities/CSSUtils.js'
import FileUtils from '../../utilities/FileUtils.js'

export default class FileImport extends Resource {
  constructor (parent, imp) {
    super(...arguments)
    let { resource } = imp.args

    this.parent = parent
    this.path = path.join(path.dirname(imp.root.source.input.file), resource.value)
  }

  load (cb) {
    glob(this.path, (err, files) => {
      if (err) {
        return cb(err)
      }

      if (files.length === 0) {
        return cb(this.error(`No files were found matching ${this.path}`))
      }

      let queue = new NGN.Tasks()

      queue.on('complete', cb)

      files.forEach((file, i) => {
        queue.add(`Resolving import ${file}`, next => {
          if (!this.parent.canImport(file)) {
            return cb(this.error(`Circular Dependency`))
          }

          let ext = FileUtils.getFileExtension(file)

          if (ext !== '.css') {
            return cb(this.error(`Invalid file extension "${ext}"`))
          }

          this.addImport({
            filepath: file,
            parent: this.parent
          }, next, cb)
        })
      })

      queue.run()
    })
  }
}
