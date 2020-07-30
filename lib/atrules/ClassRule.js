import AtRule from './AtRule.js'

export default class ClassRule extends AtRule {
  #properties = []
  #decls = []

  constructor (atrule, properties = []) {
    super(atrule)

    atrule.nodes.forEach(node => {
      switch (node.type) {
        case 'atrule': return properties.includes(node.name) ? this.#properties.push(node) : this.#decls.push(node)
        case 'decl': return this.#decls.push(node)
      }
    })
  }

  get decls () {
    return this.#decls
  }

  get name () {
    return this.params[0]?.value ?? null
  }

  get superclass () {
    return this.params[2]?.value ?? null
  }

  getProperty (name) {
    let properties = this.#properties.filter(property => property.name === name)

    switch (properties.length) {
      case 0: return null
      case 1: return properties[0]
      default: return properties
    }
  }
}

// export default class ClassRule extends AtRule {
//   type = null
//   superclass = null
//   name = null
//
//   constructor (cfg) {
//     super({
//       root: cfg.root,
//       format: '<name>[ extends <class>]',
//
//       args: [
//         {
//           name: 'name',
//           required: true,
//           types: ['word']
//         },
//
//         {
//           name: 'action',
//           types: ['word'],
//           reserved: 'extends'
//         },
//
//         {
//           name: 'superclass',
//           types: ['word']
//         }
//       ]
//     })
//
//     this.type = cfg.type
//
//     let { name, superclass } = this.args
//
//     this.name = name.value
//
//     if (superclass) {
//       this.superclass = superclass.value
//     } else if (this.args.hasOwnProperty('action')) {
//       return cb(this.error(`\nMissing argument "superclass"`, { index: this.root.params.length }))
//     }
//   }
//
//   get isExtension () {
//     return !!this.superclass
//   }
// }
