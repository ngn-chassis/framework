import AtRule from '../AtRule.js'

export default class MarginRule extends AtRule {
  display = 'block'
  x = false
  y = false
  top = false
  right = false
  bottom = false
  left = false
  typeset = null

  constructor (atrule) {
    super({
      root: atrule,
      format: 'margin'
    })

    if (this.nodes.length === 0) {
      return
    }

    this.nodes.forEach(node => {
      if (node.type !== 'decl') {
        throw node.error(`\nInvalid @margin configuration\nExpected type "declaration", received "${node.type}"`)
      }

      if (!['display', 'x', 'y', 'top', 'right', 'bottom', 'left', 'typeset'].includes(node.prop)) {
        throw node.error(`\nInvalid @margin configuration property "${node.prop}"`)
      }

      if (node.prop === 'display') {
        if (!['inline-block', 'block'].includes(node.value)) {
          throw node.error(`\nInvalid display value "${node.value}"\nValid values include: inline-block, block`, { word: node.value })
        }

        this.display = node.value
        return
      }

      if (node.prop === 'typeset') {
        this.typeset = parseFloat(node.value)
        return
      }

      let int = parseFloat(node.value)
      this[node.prop] = typeof int === 'number' ? int : node.value === 'true'
    })
  }

  get type () {
    return 'margin'
  }
}
