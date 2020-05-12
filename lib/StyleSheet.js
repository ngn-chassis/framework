import fs from 'fs-extra'
import path from 'path'
import postcss from 'postcss'
import parser from 'postcss-scss'

import ImportRule from './atrules/import/ImportRule.js'
import ComponentRule from './atrules/component/ComponentRule.js'
import ThemeRule from './atrules/theme/ThemeRule.js'
import MakeRule from './atrules/make/MakeRule.js'
import ApplyRule from './atrules/apply/ApplyRule.js'
import TypesetRule from './atrules/typeset/TypesetRule.js'
import DisplayRule from './atrules/display/DisplayRule.js'

import ModuleStore from './data/stores/ModuleStore.js'
import ComponentStore from './data/stores/ComponentStore.js'
import ThemeStore from './data/stores/ThemeStore.js'
import VersionStore from './data/stores/VersionStore.js'

import FileImport from './atrules/import/FileImport.js'
import ModuleImport from './atrules/import/ModuleImport.js'

import Component from './atrules/component/Component.js'
import Theme from './atrules/theme/Theme.js'
import Version from './atrules/make/Version.js'

import QueueUtils from './utilities/QueueUtils.js'

export default class Stylesheet {
  #root = null
  #filepath = null
  #imported = false

  #importRules = []
  #componentRules = []
  #themeRules = []
  #makeRules = []
  #applyRules = {
    display: [],
    typeset: []
  }

  #hoistedNodes = []

  #modules = new ModuleStore()
  #components = new ComponentStore()
  #themes = new ThemeStore()
  #versions = new VersionStore()

  constructor (filepath, imported = false) {
    this.#root = parser.parse(fs.readFileSync(filepath), { from: filepath })

    this.#filepath = filepath
    this.#imported = imported

    this.#root.walkAtRules(atrule => {
      switch (atrule.name) {
        case 'import': return this.#importRules.push(new ImportRule(atrule))
        case 'component': return this.#componentRules.push(new ComponentRule(atrule))
        case 'theme': return this.#themeRules.push(new ThemeRule(atrule))
        case 'make': return this.#makeRules.push(new MakeRule(atrule))
      }
    })
  }

  get applyRules () {
    return this.#applyRules
  }

  get components () {
    return this.#components
  }

  get componentRules () {
    return this.#componentRules
  }

  get displayRules () {
    return this.#applyRules.display
  }

  get filepath () {
    return this.#filepath
  }

  get hasImports () {
    return this.#importRules.length > 0
  }

  get hoistedNodes () {
    return this.#hoistedNodes
  }

  get importRules () {
    return this.#importRules
  }

  get isImported () {
    return this.#imported
  }

  get makeRules () {
    return this.#makeRules
  }

  get modules () {
    return this.#modules.data
  }

  get root () {
    return this.#root
  }

  get themes () {
    return this.#themes.data
  }

  get themeRules () {
    return this.#themeRules
  }

  get typesetRules () {
    return this.#applyRules.typeset
  }

  get versions () {
    return this.#versions.data
  }

  append (css) {
    this.#root.append(css)
  }

  clone () {
    return this.#root.clone()
  }

  hoist (node) {
    this.#hoistedNodes.push(node)
  }

  prepend (css) {
    this.#root.prepend(css)
  }

  toString () {
    return this.#root.toString()
  }

  resolve (resolve, reject) {
    this.#resolveImports([], this, err => {
      if (err) {
        return reject(err)
      }

      this.#registerComponents()
      this.#registerThemes()
      this.#registerVersions()
      resolve()
    })
  }

  registerApplyRule (atrule) {
    atrule = new ApplyRule(atrule)

    switch (atrule.type) {
      case 'typeset':
        this.#applyRules.typeset.push(new TypesetRule(atrule.root))
        break

      case 'block':
      case 'inline-block':
      case 'inline':
        this.#applyRules.display.push(new DisplayRule(atrule.root))
        break

      default: throw atrule.error(`\nInvalid at-rule "${atrule.type}"`)
    }

    atrule.remove()
  }

  // #registerApplyRules = applyRules => {
  //   Object.keys(applyRules).forEach(category => {
  //     applyRules[category].forEach(this.#registerApplyRule)
  //   })
  // }

  #registerComponent = rule => {
    this.#components.add(new Component(rule))
    rule.remove()
  }

  #registerComponents = () => {
    let components = this.#modules.get('components')

    if (!components) {
      return
    }

    Object.keys(components).forEach(component => {
      this.#registerComponent(this.#modules.get('components')[component])
    })

    this.componentRules.forEach(this.#registerComponent)
  }

  #registerTheme = rule => {
    this.#themes.add(new Theme(rule))
    rule.remove()
  }

  #registerThemes = () => this.themeRules.forEach(this.#registerTheme)

  #registerVersion = rule => {
    this.#versions.add(new Version(rule))
    rule.remove()
  }

  #registerVersions = () => this.makeRules.forEach(this.#registerVersion)

  #resolveFileImport = (chain, rule, resolve, reject) => {
    let imp = new FileImport(rule)

    imp.resolve((err, stylesheets) => {
      if (err) {
        return reject(err)
      }

      if (!stylesheets || stylesheets.length === 0) {
        return resolve()
      }

      stylesheets.forEach(stylesheet => {
        if (chain.includes(stylesheet.filepath)) {
          return reject(rule.error(`\nCircular Dependency\n${chain.join('\n--> ')}\n--> ${stylesheet.filepath}`))
        }
      })

      QueueUtils.run({
        log: false,

        tasks: stylesheets.map(stylesheet => ({
          name: `Resolving Child Import`,
          callback: next => this.#resolveImports(chain, stylesheet, err => {
            if (err) {
              return reject(err)
            }

            stylesheet.componentRules.forEach(rule => this.#registerComponent(rule))
            stylesheet.themeRules.forEach(rule => this.#registerTheme(rule))
            // this.versions.push(...child.versions)

            // this.#registerApplyRules(stylesheet.applyRules)

            imp.replaceWith(stylesheet.clone())
            next()
          })
        }))
      })
      .then(resolve)
      .catch(reject)
    })
  }

  #resolveModuleImport = (rule, resolve, reject) => {
    let imp = new ModuleImport(rule)

    imp.resolve((err, funcs) => {
      if (err) {
        return reject(err)
      }

      this.#modules.add(imp, funcs)
      rule.remove()
      resolve()
    })
  }

  #resolveImports = (chain, stylesheet, cb) => {
    if (!stylesheet.hasImports) {
      return cb()
    }

    chain.push(stylesheet.filepath)

    QueueUtils.run({
      pad: {
        start: '    '
      },

      tasks: stylesheet.importRules.map(rule => ({
        name: `Importing ${rule.params}${stylesheet.filepath ? ` into ${stylesheet.filepath}` : ''}`,
        callback: next => {
          let { type } = rule
          let id = NGN.DATA.util.GUID()

          switch (type) {
            case 'file': return this.#resolveFileImport(chain, rule, next, cb)
            case 'module': return this.#resolveModuleImport(rule, next, cb)
            default: return cb(rule.error(`\nInvalid import`))
          }
        }
      }))
    }).then(() => {
      chain.pop()
      cb()
    }).catch(cb)
  }
}
