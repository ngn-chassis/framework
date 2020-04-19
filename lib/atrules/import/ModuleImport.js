import fs from 'fs-extra'
import path from 'path';
import { fileURLToPath } from 'url';

import Resource from './Resource.js'
import Stylesheet from '../../Stylesheet.js'

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
        if (this.source === 'chassis') {
          return import(`../../modules/${module}.js`).then(module => {
            module.default.render((err, root) => {
              if (err) {
                return cb(err)
              }

              this.addImport({
                css: root,
                parent: this.parent
              }, next, cb)
            })
          })
        }

        console.log('RESOLVE CUSTOM MODULE ' + module)
      })
    })

    queue.run(true)
  }
}
