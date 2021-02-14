import path from 'path'
import glob from 'fast-glob'

import { CONFIG } from '../../../index.js'
import Resource from './Resource.js'

import FileUtils from '../../utilities/FileUtils.js'

export default class FileResource extends Resource {
  #filepath
  #filepaths = []
  #resource

  constructor (importRule) {
    super(importRule)
    this.#resource = importRule.resource.value
    this.#filepath = path.join(path.dirname(importRule.root.source.input.file), importRule.resource.value)
  }

  get filepath () {
    return this.#filepath
  }

  resolve (cb) {
    const files = glob.sync(this.filepath)

    if (files.length === 0) {
      return cb(this.error(`\nNo files found matching "${this.#resource}"`, { word: this.#resource }))
    }

    files.forEach(file => {
      const extension = FileUtils.getFileExtension(file)

      if (!this.#extensionIsValid(extension)) {
        return cb(this.error(`\nInvalid file extension "${extension}"`, { word: extension }))
      }

      this.#filepaths.push(file)
    })

    cb(null, this.#filepaths)
  }

  #extensionIsValid = extension => {
    return CONFIG.validFileExtensions.some(validExtension => extension === `.${validExtension}`)
  }
}
