import fs from 'fs-extra'
import path from 'path';
import { fileURLToPath } from 'url';
import glob from 'glob'
import parseValue from 'postcss-value-parser'

import Resource from './Resource.js'
import Stylesheet from '../../Stylesheet.js'
import CSSUtils from '../../utilities/CSSUtils.js'
import FileUtils from '../../utilities/FileUtils.js'

export default class ModuleImport extends Resource {
  constructor (parent, imp) {
    super(...arguments)
    let { resource, source } = imp.args

    this.parent = parent

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
    let queue = new NGN.Tasks()

    queue.on('complete', cb)

    this.modules.forEach(module => {
      queue.add(`Importing ${module} from ${this.source}`, next => {
        let source = parseValue(this.source).nodes[0]

        switch (source.type) {
          case 'word': return this.#loadInternalModule(module, next, cb)
          case 'string': return this.#loadCustomModule(module, next, cb)
        }
      })
    })

    queue.run(true)
  }

  #loadCustomModule = (module, accept, reject) => {
    console.log(module, this.source)
  }

  #loadInternalModule = (name, accept, reject) => {
    let dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../components')

    if (!FileUtils.fileExists(path.join(dir, `${name}.js`))) {
      return reject(this.error(`\nInvalid component "${name}"`))
    }

    glob(path.join(dir, `${name}.js`), (err, files) => {
      let queue = new NGN.Tasks()

      queue.on('complete', accept)

      files.forEach(file => {
        queue.add(`Importing ${name}`, next => {
          import(file).then(module => {
            this.addImport({
              parent: this.parent,
              css: module.default
            }, next, reject)
          }).catch(reject)
        })
      })

      queue.run(true)
    })
  }
}
