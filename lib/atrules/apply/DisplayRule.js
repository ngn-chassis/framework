import AtRule from '../AtRule.js'

export default class DisplayRule extends AtRule {
  #display = 'inline-block'
  #x = false
  #y = false
  #top = false
  #right = false
  #bottom = false
  #left = false
  #typeset = null

  constructor (atrule) {
    super(atrule)

    atrule.walkDecls(({ prop, value }) => {
      switch (prop) {
        case 'display':
          this.#display = value
          break

        case 'typeset':
          this.#typeset = value
          break

        case 'x':
          this.#x = value
          break

        case 'y':
          this.#y = value
          break

        case 'top':
          this.#top = value
          break

        case 'right':
          this.#right = value
          break

        case 'bottom':
          this.#bottom = value
          break

        case 'left':
          this.#left = value
          break

        default:

      }
    })
  }

  get display () {
    return this.#display
  }

  get x () {
    return this.#x
  }

  get y () {
    return this.#y
  }

  get top () {
    return this.#top
  }

  get right () {
    return this.#right
  }

  get bottom () {
    return this.#bottom
  }

  get left () {
    return this.#left
  }

  get typeset () {
    return this.#typeset
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
