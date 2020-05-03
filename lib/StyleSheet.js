import fs from 'fs-extra'
import path from 'path'
import postcss from 'postcss'

import ImportRule from './atrules/import/ImportRule.js'
import ComponentRule from './atrules/component/ComponentRule.js'
import ThemeRule from './atrules/theme/ThemeRule.js'
import MakeRule from './atrules/make/MakeRule.js'

import ModuleStore from './data/stores/ModuleStore.js'
import ComponentStore from './data/stores/ComponentStore.js'

import FileImport from './atrules/import/FileImport.js'
import ModuleImport from './atrules/import/ModuleImport.js'

import Component from './atrules/component/Component.js'

import QueueUtils from './utilities/QueueUtils.js'

export default class Stylesheet {
  #root = null
  #filepath = null
  #imported = false

  #importRules = []
  #componentRules = []
  #themeRules = []
  #makeRules = []

  #modules = new ModuleStore()
  #components = new ComponentStore()
  // #themes = {}
  #versions = []
  // themes = new ThemeStore()
  // versions = new VersionStore()

  constructor (filepath, imported = false) {
    this.#root = postcss.parse(fs.readFileSync(filepath), { from: filepath })
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

  get isImported () {
    return this.#imported
  }

  get filepath () {
    return this.#filepath
  }

  get root () {
    return this.#root
  }

  get components () {
    return this.#components
  }

  get componentRules () {
    return this.#componentRules
  }

  get modules () {
    return this.#modules.data
  }

  get importRules () {
    return this.#importRules
  }

  get makeRules () {
    return this.#makeRules
  }

  get makeRules () {
    return this.#makeRules
  }

  get hasImports () {
    return this.#importRules.length > 0
  }

  get themes () {
    return {}
  }

  get versions () {
    let versions = []

    if (!this.#versions.some(version => version === 'default')) {
      versions.push('default')
    }

    return versions
  }

  append (css) {
    this.#root.append(css)
  }

  clone () {
    return this.#root.clone()
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

      this.#registerComponents(resolve, reject)
    })
  }

  #registerComponent = rule => {
    this.#components.add(new Component(rule))
    rule.remove()
  }

  #registerComponents = (resolve, reject) => {
    let components = this.#modules.get('components')

    Object.keys(components).forEach(component => {
      this.#registerComponent(this.#modules.get('components')[component])
    })

    this.componentRules.forEach(rule => this.#registerComponent(rule))
    resolve()
  }

  #resolveFileImport = (chain, rule, resolve, reject) => {
    let imp = new FileImport(rule)

    imp.resolve((err, stylesheets) => {
      if (err) {
        return reject(err)
      }

      stylesheets.forEach(stylesheet => {
        if (chain.includes(stylesheet.filepath)) {
          return cb(rule.error(`\nCircular Dependency\n${chain.join('\n--> ')}\n--> ${stylesheet.filepath}`))
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
            // this.themes.push(...child.themes)
            // this.versions.push(...child.versions)

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
