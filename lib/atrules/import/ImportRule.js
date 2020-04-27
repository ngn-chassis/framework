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

        { types: ['space'] },

        {
          name: 'from',
          types: ['word'],
          reserved: 'from'
        },

        { types: ['space'] },

        {
          name: 'source',
          types: ['string', 'word']
        }
      ]
    })

    let { resource, source } = this.args
    this.type = resource.type === 'string' ? 'file' : 'module'

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
  }
}
