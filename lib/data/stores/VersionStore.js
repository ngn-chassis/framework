export default class VersionStore {
  #versions = {}

  get data () {
    let versions = this.#versions

    if (!versions.hasOwnProperty('default')) {
      versions.default = {
        theme: 'default',
        filepath: null
      }
    }

    return this.#versions
  }

  add (version) {
    if (this.#versions.hasOwnProperty(version.theme)) {
      throw version.error(`\nDuplicate version "${version.theme}"`, { word: version.theme })
    }

    this.#versions[version.theme] = version
  }

  get (name) {
    return this.#versions[name]
  }

  has (name) {
    return this.#versions.hasOwnProperty(name)
  }
}
