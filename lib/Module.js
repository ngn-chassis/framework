import postcss from 'postcss'
import perfectionist from 'perfectionist'
import Config from './data/Config.js'

export default class Module {
  static resolve (id, tree, cb) {
    perfectionist.process(tree.toString(), Config.beautify).then(result => {
      let root = postcss.parse(result.toString(), { from: void 0 })
      root.source.input.id = id
      cb(null, root)
    })
  }
}
