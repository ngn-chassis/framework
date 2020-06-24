import path from 'path'
import glob from 'glob'

import Stylesheet from '../../Stylesheet.js'
import Resource from './Resource.js'
import FileUtils from '../../utilities/FileUtils.js'
import QueueUtils from '../../utilities/QueueUtils.js'

export default class FileImport extends Resource {
  #output = []

  constructor (rule) {
    super(rule)

    let { resource } = rule.args
    this.filepath = path.join(path.dirname(rule.root.source.input.file), resource.value)
  }

  resolve (cb) {
    glob(this.filepath, (err, files) => {
      if (err) {
        return cb(err)
      }

      if (files.length === 0) {
        return cb()
        // return cb(this.error(`\nFile not found ${this.filepath}`))
      }

      QueueUtils.run({
        log: false,

        tasks: files.map((file, i) => ({
          name: `Analyzing ${file}`,
          callback: next => {
            let ext = FileUtils.getFileExtension(file)

            if (ext !== '.css') {
              return cb(this.error(`Invalid file extension "${ext}"`))
            }

            this.#output.push(new Stylesheet(file, true))
            next()
          }
        }))
      })
      .then(() => cb(null, this.#output))
      .catch(cb)
    })
  }
}
