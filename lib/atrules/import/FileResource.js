import path from 'path'
import glob from 'fast-glob'

import { CONFIG } from '../../../index.js'
import Resource from './Resource.js'

import FileUtils from '../../utilities/FileUtils.js'
import QueueUtils from '../../utilities/QueueUtils.js'

export default class FileResource extends Resource {
  #filepath
  #filepaths = []

  constructor (importRule) {
    super(importRule)
    this.#filepath = path.join(path.dirname(importRule.root.source.input.file), importRule.resource.value)
  }

  get filepath () {
    return this.#filepath
  }

  resolve (cb) {
    let files = glob.sync(this.filepath)

    if (files.length === 0) {
      return cb(this.error(`\nNo files found matching "${resource}"`, { word: resource }))
    }

    files.forEach(file => {
      let extension = FileUtils.getFileExtension(file)

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
