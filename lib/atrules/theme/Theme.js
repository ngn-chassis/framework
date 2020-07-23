import nesting from 'postcss-nesting'
import ApplyRule from '../apply/ApplyRule.js'
import Application from '../apply/Application.js'
import QueueUtils from '../../utilities/QueueUtils.js'

export default class Theme {
  #root = null
  #components = []
  #headings = []
  #sharedHeadingStyles = []

  constructor (rule) {
    this.#root = rule.root
    this.#headings = NGN.coalesce(rule.headings, [])
    this.#components = rule.components
    this.#sharedHeadingStyles = rule.sharedHeadingStyles

    this.name = rule.args.name.value
    this.properties = rule.properties
  }

  get components () {
    return this.#components
  }

  get css () {
    return this.#root.toString()
  }

  get headings () {
    return this.#headings
  }

  get sharedHeadingStyles () {
    return this.#sharedHeadingStyles
  }

  get json () {
    return {
      name: this.name,
      properties: this.properties,
      headings: this.headings,
      components: this.components,
      css: this.css
    }
  }

  getApplications (components, cb) {
    // this.#resolveComponentSelectors(components, () => {
    //
    // }, cb)

    let applications = []
    let tasks = []

    this.#root.walkAtRules('apply', atrule => {
      tasks.push({
        name: 'Processing @apply rule',
        callback: next => {
          let rule = new ApplyRule(atrule)

          rule.validate(components, err => {
            if (err) {
              return cb(err)
            }

            applications.push(new Application(rule))
            atrule.remove()
            next()
          })
        }
      })
    })

    QueueUtils.run({
      log: false,
      tasks
    })
    .then(() => cb(null, applications))
    .catch(cb)
  }

  #resolveComponentSelectors = (components, resolve, reject) => {
    // Object.values(components).forEach(component => console.log(component.states))

    QueueUtils.run({
      log: false,

      tasks: this.components.reduce((tasks, component) => {
        let match = components[component.name]

        if (!match) {
          return tasks
        }

        tasks.push({
          name: `Update "${component.name}" component theme selector`,
          callback: next => {
            match.resolveSelectorWithExtensions((err, result) => {
              component.root.selector = result
              next()
            })
          }
        })

        return tasks
      }, [])
    })
    .then(resolve)
    .catch(reject)
  }
}
