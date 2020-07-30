import path from 'path';
import { fileURLToPath } from 'url';

import Resource from './Resource.js'
import FileUtils from '../../utilities/FileUtils.js'

export default class ModuleResource extends Resource {
  get resource () {
    let { resource } = super.source

    return resource.type === 'function'
      ? resource.nodes.reduce((output, node) => {
        if (node.type === 'word') {
          output.push(node.value)
        }

        return output
      }, [])
      : resource.value === '*'
        ? resource.value
        : [resource.value]
  }

  get source () {
    return super.source.source
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
