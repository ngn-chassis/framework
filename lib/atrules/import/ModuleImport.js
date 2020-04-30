import path from 'path';
import { fileURLToPath } from 'url';

import Resource from './Resource.js'
import FileUtils from '../../utilities/FileUtils.js'

export default class ModuleImport extends Resource {
  internal = false

  constructor (rule) {
    super(rule)
    let { resource, source } = rule.args

    this.resources = resource.type === 'function'
      ? resource.nodes.reduce((output, node) => {
        if (node.type === 'word') {
          output.push(node.value)
        }

        return output
      }, [])
      : resource.value === '*' ? resource.value : [resource.value]

    this.source = source.value

    if (source.type === 'word' && this.source.includes('.')) {
      let parts = this.source.split('.')

      if (parts[0] === 'chassis') {
        this.internal = true
        this.source = parts.slice(1).join('.')
      }
    }
  }

  resolve (cb) {
    let filepath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), this.internal ? `../../modules/${this.source}.js` : this.source)

    if (!FileUtils.fileExists(filepath)) {
      return cb(this.error(`\nModule "${this.source}" not found`))
    }

    import(filepath).then(module => {
      let obj = this.resources === '*'
        ? module.default
        : this.resources.reduce((final, resource) => {
          let func = module.default[resource]

          if (!func) {
            return cb(this.error(`\nModule ${this.internal ? `"${this.source}"` : `at ${this.source}`} does not contain resource "${resource}"`, { word: resource }))
          }

          final[resource] = func
          return final
        }, {})

      cb(null, obj)
    }).catch(cb)
  }
}
