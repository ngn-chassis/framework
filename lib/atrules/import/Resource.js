import Stylesheet from '../../Stylesheet.js'
import CSSUtils from '../../utilities/CSSUtils.js'

export default class Resource {
  #root = null
  #index = null
  #name = null

  placeholders = {}

  constructor (parent, imp) {
    let { resource } = imp.args

    this.#root = imp.root
    this.#index = resource.index
    this.type = imp.type
  }

  // get components () {
  //   return this.#get('components')
  // }
  //
  // get exports () {
  //   return this.#get('exports')
  // }

  // get hasPlaceholders () {
  //   console.log(this.placeholders)
  //   return Reflect.ownKeys(this.placeholders).length > 0
  // }

  // get mixins () {
  //   return this.#get('mixins')
  // }
  //
  // get themes () {
  //   return this.#get('themes')
  // }
  //
  // get utilities () {
  //   return this.#get('utilities')
  // }
  //
  // get versions () {
  //   return this.#get('versions')
  // }

  addImport (cfg, accept, reject) {
    let stylesheet = new Stylesheet(cfg)

    stylesheet.analyze(err => {
      if (err) {
        return reject(err)
      }

      stylesheet.validate(err => {
        if (err) {
          return reject(err)
        }

        let id = NGN.DATA.util.GUID()

        this.placeholders[id] = stylesheet
        this.#root.replaceWith(`@placeholder import ${id};`)

        accept()
      })
    })
  }

  error (message) {
    return this.#root.error(message, { index: this.#index })
  }

  // resolve (root, cb) {
  //   // this.root.replaceWith(root)
  //   cb(null, root)
  // }

  // #get = name => this.imports.reduce((collection, stylesheet) => {
  //   collection.push(...stylesheet[name])
  //   return collection
  // }, [])
}
