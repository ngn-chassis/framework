import path from 'path';

import postcss from 'postcss'
import cssnano from 'cssnano'
import perfectionist from 'perfectionist'
import env from 'postcss-preset-env'

import annotate from './plugins/annotate.js'
import charset from './plugins/charset.js'
import cleanup from './plugins/cleanup.js'
import componentResets from './plugins/componentResets.js'
import components from './plugins/components.js'
import constrainRules from './plugins/atrules/constrain.js'
import extendRules from './plugins/atrules/extend.js'
import functions from 'postcss-functions'
import hoist from './plugins/hoist.js'
import mediaRules from './plugins/atrules/media.js'
import namespace from './plugins/namespace.js'
import newRules from './plugins/atrules/new.js'
import root from './plugins/root.js'
import typography from './plugins/typography.js'
import viewport from './plugins/viewport.js'

import defaultTheme from './themes/default.js'

import Manifest from './Manifest.js'
import Module from './Module.js'

import ImportRule from './atrules/import/ImportRule.js'
import FileResource from './atrules/import/FileResource.js'
import ModuleResource from './atrules/import/ModuleResource.js'

import ComponentRule from './atrules/component/ComponentRule.js'
import Component from './atrules/component/Component.js'
import InlineComponentRule from './atrules/InlineComponentRule.js'
import InlineComponent from './atrules/InlineComponent.js'

import MakeRule from './atrules/make/MakeRule.js'
import Version from './atrules/make/Version.js'

import ThemeRule from './atrules/theme/ThemeRule.js'
import Theme from './atrules/theme/Theme.js'

import Stylesheet from './Stylesheet.js'
import Partial from './Partial.js'

import CSSUtils from './utilities/CSSUtils.js'
import QueueUtils from './utilities/QueueUtils.js'

import { CONFIG } from '../index.js'

export default class Entry extends Stylesheet {
  #files
  #manifest = new Manifest()
  #hoistedNodes = []

  get manifest () {
    return this.#manifest.json
  }

  analyze (cb) {
    QueueUtils.run({
      tasks: [{
        name: '|  |-- Registering Components',
        callback: this.#registerComponents
      }, {
        name: '|  |-- Registering Themes',
        callback: this.#registerThemes
      }, {
        name: '|  |-- Registering Versions',
        callback: this.#registerVersions
      }, {
        name: '|  |-- Registering Inline Components',
        callback: next => this.#registerInlineComponents(next, cb)
      }]
    })
    .then(cb)
    .catch(cb)
  }

  render (cb) {
    let results = []

    QueueUtils.run({
      tasks: this.#manifest.versions.map(version => ({
        name: `|  |-- Generating "${version.theme}" theme stylesheet`,
        callback: next => {
          let theme = this.#manifest.getTheme(version.theme)

          if (!theme) {
            return cb(version.error(`Theme "${version.theme}" not found`, { word: version.theme }))
          }

          let post = CONFIG.minify ? [cssnano] : [
            perfectionist(CONFIG.beautify),
            cleanup
          ]

          let annotations = []
          let { reset, customProperties, modifiers, constraints } = CONFIG.modules.internal.core.resources

          postcss([
            annotate(annotations, theme.properties, this.#manifest),

            charset(annotations),
            viewport(annotations),
            hoist(annotations, this.#hoistedNodes),

            reset(annotations),
            root(annotations),
            customProperties(annotations, theme.properties, this.#manifest.hasCoreModule('customProperties')),
            modifiers(annotations, this.#manifest.modifiers),
            constraints(annotations),

            // constrainRules,
            // mediaRules,

            componentResets(annotations, this.#manifest.components),
            components(annotations, this.#manifest.components, theme.components),

            functions({ functions: CONFIG.functions }),
            env(CONFIG.env),

            typography(annotations, theme),
            namespace,

            ...post
          ]).process(this.root.clone(), {
            from: this.filepath,
            to: version.path,
            map: { inline: false }
          }).then(result => {
            results.push({
              path: version.path,
              css: result.css,
              map: result.map
            })

            next()
          })
        }
      }))
    })
    .then(() => cb(null, results))
    .catch(cb)
  }

  // Recursive
  resolveImports (cb) {
    let tasks = []

    this.walkAtRules('import', atrule => {
      tasks.push({
        name: `Resolving @import ${atrule.params}`,
        callback: next => {
          let importRule = new ImportRule(atrule)

          switch (importRule.type) {
            case 'file': return this.#resolveFileImport(importRule, next, cb)
            case 'module': return this.#resolveModuleImport(importRule, next, cb)
            case 'function':
              this.#hoistedNodes.push(atrule)
              atrule.remove()
              return next()
          }
        }
      })
    })

    if (tasks.length === 0) {
      return cb()
    }

    QueueUtils.run({ log: false, tasks })
      .then(() => this.resolveImports(cb))
      .catch(cb)
  }

  #canImport = filepath => ![
    this.filepath,
    ...this.#manifest.partials.map(imp => imp.filepath)
  ].includes(filepath)

  #registerComponents = cb => {
    let components = Object.values(this.#manifest.componentModules)
    let extensions = []

    this.walkAtRules('component', atrule => {
      let componentRule = new ComponentRule(atrule)

      if (componentRule.superclass) {
        extensions.push(componentRule)
      } else {
        components.push(componentRule)
      }

      componentRule.remove()
    })

    components.forEach(component => this.#manifest.addComponent(new Component(component)))

    extensions.sort((a, b) => {
      return extensions.some(extension => extension.name === a.superclass) ? 1 : 0
    }).forEach(extension => {
      let { superclass } = extension
      let parent = this.#manifest.getComponent(superclass)

      if (!parent) {
        return cb(extension.error(`\nCannot extend non-existent component "${superclass}"`, { word: superclass }))
      }

      let component = new Component(extension, parent)
      parent.addExtension(component)
      this.#manifest.addComponent(component)
    })

    cb()
  }

  #registerInlineComponents = (resolve, reject) => {
    let atrules = []

    this.walkAtRules('new', atrule => atrules.push(atrule))
    this.walkAtRules('extend', atrule => atrules.push(atrule))

    QueueUtils.run({
      log: false,

      tasks: atrules.map(atrule => ({
        name: `Resolving Inline Component`,
        callback: next => {
          let componentRule = new InlineComponentRule(atrule)

          componentRule.resolveSelector((err, selector, query) => {
            if (err) {
              return reject(err)
            }

            let parent = this.#manifest.getComponent(componentRule.superclass)
            let component = new InlineComponent(componentRule, parent)

            if (!query) {
              if (component.isExtension) {
                parent.addExtension(component)
              }

              this.#manifest.addComponent(component)
            }

            atrule.replaceWith(component.resolve())
            next()
          })
        }
      }))
    })
    .then(resolve)
    .catch(reject)
  }

  #registerThemes = cb => {
    this.walkAtRules('theme', atrule => {
      let themeRule = new ThemeRule(atrule)
      this.#manifest.addTheme(new Theme(themeRule))
      themeRule.remove()
    })

    if (!this.#manifest.hasTheme('default')) {
      this.#manifest.addTheme(defaultTheme)
    }

    cb()
  }

  #registerVersions = cb => {
    this.walkAtRules('make', atrule => {
      let makeRule = new MakeRule(atrule)
      this.#manifest.addVersion(new Version(makeRule, this.filepath))
      atrule.remove()
    })

    if (!this.#manifest.hasVersion('default')) {
      let defaultMakeRule = new MakeRule(CSSUtils.createAtRule({
        name: 'make',
        params: `default "${path.basename(this.filepath)}"`
      }))

      this.#manifest.addVersion(new Version(defaultMakeRule, this.filepath))
    }

    cb()
  }

  #resolveFileImport = (importRule, resolve, reject) => {
    let imp = new FileResource(importRule)

    if (!this.#canImport(imp.filepath)) {
      return reject(imp.error(`\nCircular Dependency`, { word: importRule.resource }))
    }

    imp.resolve((err, filepaths) => {
      if (err) {
        return reject(err)
      }

      filepaths.forEach(filepath => {
        let partial = new Partial(filepath, this)
        this.#manifest.addPartial(partial)
        importRule.replaceWith(partial.clone())
      })

      resolve()
    })
  }

  #resolveModuleImport = (importRule, resolve, reject) => {
    try {
      this.#manifest.addModule(new Module(new ModuleResource(importRule)))
      importRule.remove()
      resolve()

    } catch (err) {
      reject(err)
    }
  }
}
