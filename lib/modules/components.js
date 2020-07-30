import parser from 'postcss-scss'
import ComponentUtils from '../utilities/ComponentUtils.js'

import anchor from '../components/anchor.js'
import button from '../components/button.js'
import checkbox from '../components/checkbox.js'
import input from '../components/input.js'
import meter from '../components/meter.js'
import progress from '../components/progress.js'
import radio from '../components/radio.js'
import table from '../components/table.js'
import tag from '../components/tag.js'
import textarea from '../components/textarea.js'
import authorControl from '../components/author-control.js'
import authorIcon from '../components/author-icon.js'

// TODO: Add config option to flush all default styles

export default class ComponentsModule {
  #components = {
    anchor,
    'author-control': authorControl,
    'author-icon': authorIcon,
    button,
    checkbox,
    input,
    meter,
    progress,
    radio,
    table,
    tag,
    textarea,
  }

  get name () {
    return 'components'
  }

  get resources () {
    return Object.keys(this.#components).reduce((components, component) => {
      components[component] = ComponentUtils.createComponent(component, this.#components[component])
      return components
    }, {})
  }
}
