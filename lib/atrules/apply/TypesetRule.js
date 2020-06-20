import AtRule from '../AtRule.js'

export default class TypesetRule extends AtRule {
  constructor (atrule) {
    super({
      root: atrule,
      format: 'typeset +|-number relative',

      args: [{
        name: 'size',
        types: ['word']
      }, {
        name: 'relative',
        reserved: 'relative',
        types: ['word']
      }]
    })

    this.size = this.args.hasOwnProperty('size') ? this.args.size.value : 0
    this.relative = this.args.hasOwnProperty('relative')

    if (this.nodes.length === 0) {
      return
    }

    this.nodes.forEach(node => {
      if (node.type === 'comment') {
        return
      }

      if (node.type !== 'decl') {
        throw node.error(`\nInvalid @typeset configuration\nExpected type "declaration", received "${node.type}"`)
      }

      switch (node.prop) {
        case 'size':
          this.size = parseFloat(node.value)
          break

        case 'relative':
          this.relative = node.value === 'true'
          break

        default: node.error(`\nInvalid @typeset configuration\nUnrecognized property "${node.prop}"`)
      }
    })
  }

  get type () {
    return 'typeset'
  }
}
