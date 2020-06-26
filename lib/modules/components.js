import ComponentUtils from '../utilities/ComponentUtils.js'

import anchor from '../components/anchor.js'
import button from '../components/button.js'
import input from '../components/input.js'
import tag from '../components/tag.js'
import table from '../components/table.js'
import authorControl from '../components/author-control.js'
import authorIcon from '../components/author-icon.js'

// TODO: Add config option to flush all default styles

const components = {
  anchor,
  button,
  input,
  tag,
  table,
  'author-control': authorControl,
  'author-icon': authorIcon,
}

export default new Proxy(components, {
  get (components, name) {
    return ComponentUtils.createComponent(components[name])
  }
})
