import ComponentUtils from '../utilities/ComponentUtils.js'

import anchor from '../components/anchor.js'
import button from '../components/button.js'
import input from '../components/input.js'
import tag from '../components/tag.js'
import table from '../components/table.js'

// TODO: Add config option to flush all default styles

const components = {
  anchor,
  button,
  input,
  tag,
  table
}

export default new Proxy(components, {
  get (components, name) {
    return ComponentUtils.createComponent(components[name])
  }
})
