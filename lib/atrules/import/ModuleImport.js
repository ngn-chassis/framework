import path from 'path';
import { fileURLToPath } from 'url';

import Resource from './Resource.js'
import FileUtils from '../../utilities/FileUtils.js'

export default class ModuleImport extends Resource {
  #filepath
  #internal = false
  #resource
  #source

  constructor (importRule) {
    super(importRule)

    this.#resource = importRule.resource
    this.#source = importRule.source

    if (this.#source.type === 'word' && this.#source.value.includes('chassis')) {
      this.#internal = true
      this.#source = this.#source.value.split('.').slice(1).join('.')
    }
  }

  get isInternal () {
    return this.#internal
  }

  get resource () {
    return this.#resource.type === 'function'
      ? this.#resource.nodes.reduce((output, node) => {
        if (node.type === 'word') {
          output.push(node.value)
        }

        return output
      }, [])
      : this.#resource.value === '*'
        ? this.#resource.value
        : [this.#resource.value]
  }

  get source () {
    return this.#source
  }

  // resolve (cb) {
  //   if (this.#internal) {
  //     return
  //   }
  //
  //   let filepath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), this.source)
  //
  //   if (!FileUtils.fileExists(filepath)) {
  //     return cb(this.error(`\nModule "${this.source}" not found`, { word: this.source }))
  //   }
  //
  //   import(this.#filepath)
  //     .then(module => {
  //       let funcs = this.resource === '*'
  //         ? module.default
  //         : this.resource.reduce((final, resource) => {
  //           let func = module.default[resource]
  //
  //           if (!func) {
  //             return cb(this.error(`\nModule ${this.isInternal ? `"${this.source}"` : `at ${this.source}`} does not contain resource "${resource}"`, { word: resource }))
  //           }
  //
  //           final[resource] = func
  //           return final
  //         }, {})
  //
  //       cb(null, funcs)
  //     })
  //     .catch(cb)
  // }
}
