import fs from 'fs-extra'
import postcss from 'postcss'

import ImportRule from './atrules/import/ImportRule.js'
import FileImport from './atrules/import/FileImport.js'
import ModuleImport from './atrules/import/ModuleImport.js'

import ComponentRule from './atrules/component/ComponentRule.js'
import Component from './atrules/component/Component.js'
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
  components = []

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

  resolve () {
    return this.root.clone()
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

    queue.run(true)
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

          this.placeholders[imp.id] = imp
          this.components.push(...imp.components)
          this.themes = Object.assign(this.themes, imp.themes)
          this.versions.push(...imp.versions)

          next()
        })
      })
    }, cb)
  }

  #validateComponents = cb => {
    let extensions = []
    let queue = new NGN.Tasks()

    this.#validate('Validating Component', this.#components, (component, next) => {
      component.validate(this.#components, err => {
        if (err) {
          return cb(err)
        }

        let id = NGN.DATA.util.GUID()

        if (component.extends) {
          extensions.push(component)
        } else {
          if (this.components.some(storedComponent => storedComponent.name === component.name)) {
            return cb(component.error(`\nDuplicate component "${component.name}"`, { word: component.name }))
          }

          this.components.push(new Component(component))
        }

        component.remove()
        next()
      })
    }, () => {
      extensions.forEach(extension => {
        let matches = this.components.filter(component => component.name === extension.extends)

        if (matches.length === 0) {
          return cb(extension.error(`\nCannot extend non-existent component "${extension.extends}"`, { word: extension.extends }))
        }

        let component = matches[0]
        extension = new ExtensionComponent(component, extension)

        component.addExtension(extension)
        this.components.push(extension)
      })

      cb()
    })
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
