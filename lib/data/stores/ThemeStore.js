export default class ThemeStore {
  #themes = {}

  get data () {
    return this.#themes
  }

  add (theme) {
    if (this.#themes.hasOwnProperty(theme.name)) {
      throw theme.error(`\nDuplicate theme "${theme.name}"`, { word: theme.name })
    }

    this.#themes[theme.name] = theme
  }

  get (name) {
    return this.#themes[name]
  }

  has (name) {
    return this.#themes.hasOwnProperty(name)
  }
}
