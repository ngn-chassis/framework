import AtRule from '../AtRule.js'

export default class DisplayRule extends AtRule {
  #properties = {
    display: 'inline-block',
    x: false,
    y: false,
    top: false,
    right: false,
    bottom: false,
    left: false,
    typeset: null,
    relative: false
  }

  constructor (atrule) {
    super(atrule)
    atrule.walkDecls(({ prop, value }) => this.#properties[prop] = value)
  }

  get display () {
    return this.#properties.display
  }

  get x () {
    return this.#properties.x
  }

  get y () {
    return this.#properties.y
  }

  get top () {
    return this.#properties.top
  }

  get right () {
    return this.#properties.right
  }

  get bottom () {
    return this.#properties.bottom
  }

  get left () {
    return this.#properties.left
  }

  get relative () {
    return this.#properties.relative
  }

  get typeset () {
    return this.#properties.typeset
  }
}

// export default class DisplayRule extends AtRule {
//   #type = null
//
//   display = 'inline-block'
//   x = false
//   y = false
//   top = false
//   right = false
//   bottom = false
//   left = false
//   typeset = null
//
//   constructor (atrule) {
//     super({
//       root: atrule,
//       format: `${atrule.name}`
//     })
//
//     this.#type = atrule.name
//
//     if (this.nodes.length === 0) {
//       return
//     }
//
//     this.nodes.forEach(node => {
//       if (node.type !== 'decl') {
//         throw node.error(`\nInvalid @${this.#type} configuration\nExpected type "declaration", received "${node.type}"`)
//       }
//
//       if (!['display', 'x', 'y', 'top', 'right', 'bottom', 'left', 'typeset'].includes(node.prop)) {
//         throw node.error(`\nInvalid @${this.#type} configuration property "${node.prop}"`)
//       }
//
//       if (node.prop === 'display') {
//         if (!['inline-block', 'block'].includes(node.value)) {
//           throw node.error(`\nInvalid display value "${node.value}"\nValid values include: inline-block, block`, { word: node.value })
//         }
//
//         this.display = node.value
//         return
//       }
//
//       if (node.prop === 'typeset') {
//         this.typeset = parseFloat(node.value)
//         return
//       }
//
//       let int = parseFloat(node.value)
//       this[node.prop] = isNaN(int) ? node.value === 'true' : int
//     })
//   }
//
//   get type () {
//     return this.#type
//   }
// }
