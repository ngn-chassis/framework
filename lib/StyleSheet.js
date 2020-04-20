import fs from 'fs-extra'
import postcss from 'postcss'

import ImportRule from './atrules/import/ImportRule.js'
import FileImport from './atrules/import/FileImport.js'
import ModuleImport from './atrules/import/ModuleImport.js'

import ComponentRule from './atrules/component/ComponentRule.js'
import BaseComponent from './atrules/component/BaseComponent.js'
import ExtensionComponent from './atrules/component/ExtensionComponent.js'

import ThemeRule from './atrules/theme/ThemeRule.js'
import Theme from './atrules/theme/Theme.js'

import MakeRule from './atrules/make/MakeRule.js'
import Version from './atrules/make/Version.js'

export default class Stylesheet {
  filepath = null
  parent = null
  root = null

  #imports = []
  #components = []
  #themes = []
  #versions = []

  themes = {}
  versions = []
  placeholders = {}

  constructor ({ filepath, parent = null, css = null }) {
    this.filepath = filepath
    this.parent = parent
    this.isImported = !!parent

    let source = filepath ? fs.readFileSync(filepath) : css

    this.root = NGN.typeof(source) === 'object'
      ? source
      : postcss.parse(source, { from: NGN.coalesce(filepath, 'chassis') })
  }

  get type () {
    return 'stylesheet'
  }

  analyze (cb) {
    this.root.walkAtRules(atrule => {
      switch (atrule.name) {
        case 'import': return this.#imports.push(new ImportRule(atrule))
        case 'component': return this.#components.push(new ComponentRule(atrule))
        case 'theme': return this.#themes.push(new ThemeRule(atrule))
        case 'make': return this.#versions.push(new MakeRule(atrule))
      }
    })

    cb()
  }

  canImport (filepath) {
    return filepath !== this.filepath && (this.isImported ? this.parent.canImport(filepath) : true)
  }

  getTheme (name) {
    return this.themes[name]
  }

  hasTheme (name) {
    return this.themes.hasOwnProperty(name)
  }

  get hasPlaceholders () {
    return Reflect.ownKeys(this.placeholders).length > 0
  }

  toString () {
    return this.root.toString()
  }

  append (css) {
    this.root.append(css)
  }

  prepend (css) {
    this.root.prepend(css)
  }

  validate (cb) {
    let callback = (err, next) => {
      if (err) {
        return cb(err)
      }

      next()
    }

    let queue = new NGN.Tasks()

    queue.on('complete', cb)

    queue.add('Validating Imports', next => {
      this.#validateImports(err => callback(err, next))
    })

    queue.add('Validating Components', next => {
      this.#validateComponents(err => callback(err, next))
    })

    queue.add('Validating Themes', next => {
      this.#validateThemes(err => callback(err, next))
    })

    queue.add('Validating Versions', next => {
      this.#validateVersions(err => callback(err, next))
    })

    queue.run(true)
  }

  #validate = (message, collection, process, cb) => {
    let queue = new NGN.Tasks()

    queue.on('complete', cb)

    collection.forEach(item => {
      queue.add(message, next => process(item, next))
    })

    queue.run()
  }

  #validateImports = cb => {
    this.#validate('Validating Import', this.#imports, (imp, next) => {
      imp.validate(err => {
        if (err) {
          return cb(err)
        }

        imp = imp.type === 'file' ? new FileImport(this, imp) : new ModuleImport(this, imp)

        imp.load(err => {
          if (err) {
            return cb(err)
          }

          this.placeholders = Object.assign(this.placeholders, imp.placeholders)

          next()
        })
      })
    }, cb)
  }

  #validateComponents = cb => {
    this.#validate('Validating Component', this.#components, ComponentRule, (component, next) => {
      component.validate(err => {
        if (err) {
          return cb(err)
        }

        this.components.push(component.extends ? new ExtensionComponent(component) : new BaseComponent(component))
        // component.remove()
        next()
      })
    }, cb)
  }

  #validateThemes = cb => {
    this.#validate('Validating Theme', this.#themes, (theme, next) => {
      theme.validate(err => {
        if (err) {
          return cb(err)
        }

        this.themes[theme.name] = new Theme(theme)
        theme.remove()
        next()
      })
    }, cb)
  }

  #validateVersions = cb => {
    this.#validate('Validating Version', this.#versions, (version, next) => {
      version.validate(err => {
        if (err) {
          return cb(err)
        }

        if (!this.hasTheme(version.theme)) {
          return cb(version.error(`Theme "${version.theme}" does not exist`, {
            word: version.theme
          }))
        }

        this.versions.push(version.theme)
        version.remove()
        next()
      })
    }, cb)
  }
}
