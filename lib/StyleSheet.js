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
  #isValid = false

  filepath = null
  parent = null
  root = null

  #imports = []
  #chassisImports = []
  #userImports = []
  imports = []

  #components = []
  components = []

  #themes = []
  themes = []

  #versions = []
  versions = []

  constructor ({ filepath, parent = null, css = null }) {
    this.filepath = filepath
    this.parent = parent
    this.isImported = !!parent

    let source = filepath ? fs.readFileSync(filepath) : css

    this.root = NGN.typeof(source) === 'object'
      ? source
      : postcss.parse(source, { from: NGN.coalesce(filepath, 'chassis') })
  }

  get isValid () {
    return this.#isValid
  }

  get type () {
    return 'stylesheet'
  }

  analyze (cb) {
    this.root.walkAtRules(atrule => {
      switch (atrule.name) {
        case 'import': return this.#imports.push(atrule)
        case 'component': return this.#components.push(atrule)
        case 'theme': return this.#themes.push(atrule)
        case 'make': return this.#versions.push(atrule)
      }
    })

    cb()
  }

  canImport (filepath) {
    return filepath !== this.filepath && (this.isImported ? this.parent.canImport(filepath) : true)
  }

  getTheme (name) {
    return this.themes.find(theme => theme.name === name)
  }

  hasTheme (name) {
    return this.themes.some(theme => theme.name === name)
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
    if (this.#isValid) {
      return
    }

    let callback = (err, next) => {
      if (err) {
        return cb(err)
      }

      next()
    }

    let queue = new NGN.Tasks()

    queue.on('complete', () => {
      this.#isValid = true
      cb()
    })

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

  #validate = (message, collection, constructor, process, cb) => {
    let queue = new NGN.Tasks()

    queue.on('complete', cb)

    collection.forEach(atrule => {
      queue.add(message, next => {
        let definition = new constructor(atrule)
        process(definition, next)
      })
    })

    queue.run()
  }

  #validateImports = cb => {
    this.#validate('Validating Import', this.#imports, ImportRule, (imp, next) => {
      imp.validate(err => {
        if (err) {
          return cb(err)
        }

        imp = imp.type === 'file' ? new FileImport(this, imp) : new ModuleImport(this, imp)

        imp.load(err => {
          if (err) {
            return cb(err)
          }

          this.components.push(...imp.components)
          // this.mixins.push(...imp.mixins)
          // this.exports.push(...imp.exports)
          this.versions.push(...imp.versions)
          // this.utilities.push(...imp.utilities)
          this.themes.push(...imp.themes)
          this.imports.push(imp)

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
    this.#validate('Validating Theme', this.#themes, ThemeRule, (theme, next) => {
      theme.validate(err => {
        if (err) {
          return cb(err)
        }

        this.themes.push(new Theme(theme))
        // theme.remove()
        next()
      })
    }, cb)
  }

  #validateVersions = cb => {
    this.#validate('Validating Version', this.#versions, MakeRule, (version, next) => {
      version.validate(err => {
        if (err) {
          return cb(err)
        }

        if (!this.hasTheme(version.theme)) {
          return cb(version.error(`Theme "${version.theme}" does not exist`, {
            word: version.theme
          }))
        }

        this.versions.push(new Version(version))
        // version.remove()
        next()
      })
    }, cb)
  }
}
