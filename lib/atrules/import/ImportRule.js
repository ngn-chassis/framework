import AtRule from '../AtRule.js'

export default class ImportRule extends AtRule {
  constructor (atrule) {
    super({
      root: atrule,

      format: '<resource>[ from <source>]',

      args: [
        {
          name: 'resource',
          required: true,
          types: ['string', 'word', 'function']
        },

        {
          name: 'from',
          types: ['word'],
          reserved: 'from'
        },

        {
          name: 'source',
          types: ['string', 'word', 'function']
        }
      ]
    })

    let { resource, source } = this.args

    this.type = resource.type === 'string'
      ? 'file'
      : !!source ? 'module' : 'file'

    // TODO: Handle remote imports

    if (this.type === 'module') {
      this.modules = resource.type === 'word'
        ? [resource.value]
        : resource.nodes.reduce((modules, node) => {
          if (node.type !== 'word') {
            return modules
          }

          return [...modules, node.value]
        }, [])
    }

    this.resource = resource.value
  }
}
