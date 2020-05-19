import MediaQuery from '../../atrules/media/MediaQuery.js'

export default class MediaQueryStore {
  #queries = new Map()

  get data () {
    return this.#queries
  }

  add (atrule) {
    this.#queries.set(atrule, new MediaQuery(atrule))
  }

  get (atrule) {
    return this.#queries.get(atrule)
  }

  has (atrule) {
    return this.#queries.has(atrule)
  }
}
