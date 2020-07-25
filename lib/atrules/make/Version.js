import path from 'path'
import { CONFIG } from '../../../index.js'

export default class Version {
  #source
  #entryFilepath

  constructor (makeRule, entryFilepath) {
    this.#source = makeRule
    this.#entryFilepath = entryFilepath
  }

  get theme () {
    return this.#source.theme
  }

  get path () {
    return path.join(CONFIG.output, this.#source.path ?? `${path.basename(this.#entryFilepath, '.css')}${this.theme !== 'default' ? `.${this.theme}` : ''}.css`)
  }

  error () {
    return this.#source.error(...arguments)
  }
}
