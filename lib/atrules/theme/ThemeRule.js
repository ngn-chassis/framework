import ClassRule from '../ClassRule.js'

export default class ThemeRule extends ClassRule {
  constructor (atrule) {
    super(atrule, [
      'properties',
      'headings',
      'components'
    ])
  }

  get name () {
    return this.params[0]?.value ?? null
  }

  get components () {
    return this.getProperty('components') ?? null
  }

  get headings () {
    return this.getProperty('headings') ?? null
  }

  get properties () {
    return this.getProperty('properties') ?? null
  }
}
