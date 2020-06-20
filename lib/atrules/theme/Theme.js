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

  getApplications (cb) {
    let applications = []
    let tasks = []

    this.#root.walkAtRules('apply', atrule => {
      tasks.push({
        name: 'Processing @apply rule',
        callback: next => {
          let rule = new ApplyRule(atrule)

          rule.validate(err => {
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
}
