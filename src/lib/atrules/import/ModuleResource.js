import Resource from './Resource.js'

export default class ModuleResource extends Resource {
  get resource () {
    let { resource } = super.source

    return resource.type === 'function'
      ? resource.nodes.reduce((output, node) => {
        if (node.type === 'word') {
          output.push(node.value)
        }

        return output
      }, [])
      : resource.value === '*'
        ? resource.value
        : [resource.value]
  }

  get source () {
    return super.source.source
  }
}
