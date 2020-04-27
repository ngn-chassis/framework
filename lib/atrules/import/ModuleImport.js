import fs from 'fs-extra'
import path from 'path';
import { fileURLToPath } from 'url';
import glob from 'glob'
import parseValue from 'postcss-value-parser'
import postcss from 'postcss'

import Resource from './Resource.js'
import Stylesheet from '../../Stylesheet.js'
import CSSUtils from '../../utilities/CSSUtils.js'
import FileUtils from '../../utilities/FileUtils.js'
import QueueUtils from '../../utilities/QueueUtils.js'

export default class ModuleImport extends Resource {
  #output = []

  constructor (rule) {
    super(rule)
    let { resource, source } = rule.args

    this.modules = resource.type === 'function'
      ? resource.nodes.reduce((output, node) => {
        if (node.type === 'word') {
          output.push(node.value)
        }

        return output
      }, [])
      : [resource.value]

    this.source = source.value
  }

  load (cb) {
    QueueUtils.queue({
      log: false,

      tasks: this.modules.map(module => ({
        name: `Analyzing ${module} from ${this.source}`,
        callback: next => {
          let source = parseValue(this.source).nodes[0]

          switch (source.type) {
            case 'word': return this.#loadInternalModule(module, next, cb)
            case 'string': return this.#loadCustomModule(module, next, cb)
          }
        }
      }))
    })
    .then(() => cb(null, this.#output))
    .catch(cb)
  }

  #loadCustomModule = (module, resolve, reject) => {
    console.log(module, this.source)
  }

  #loadInternalModule = (name, resolve, reject) => {
    let dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../components')

    if (!FileUtils.fileExists(path.join(dir, `${name}.js`))) {
      return reject(this.error(`\nModule "${name}" not found`))
    }

    glob(path.join(dir, `${name}.js`), (err, files) => {
      QueueUtils.queue({
        log: false,

        tasks: files.map(file => ({
          name: `Generating stylesheet`,

          callback: next => {
            import(file).then(module => {
              this.#output[name] = new Stylesheet(postcss.parse(module.default, { from: 'chassis' }), null, true)
              next()
            }).catch(reject)
          }
        }))
      })
      .then(resolve)
      .catch(reject)
    })
  }
}
