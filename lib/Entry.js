// import fs from 'fs-extra'
import path from 'path'

import postcss from 'postcss'
import cssnano from 'cssnano'
import perfectionist from 'perfectionist'
import env from 'postcss-preset-env'

import defaultTheme from './themes/default.js'

// import resolveAtRules from './plugins/resolveAtRules.js'
// import processThemeApplications from './plugins/processThemeApplications.js'
// import generateCore from './plugins/core/generateCore.js'
import annotate from './plugins/annotate.js'
import applyNamespace from './plugins/applyNamespace.js'
import charset from './plugins/charset.js'
import cleanup from './plugins/cleanup.js'
import constraints from './plugins/constraints.js'
import customProperties from './plugins/customProperties.js'
import modifiers from './plugins/modifiers.js'
import resolveFunctions from 'postcss-functions'
import reset from './plugins/reset.js'

import Constants from './data/Constants.js'

// import ModuleManager from './data/managers/ModuleManager.js'

import CoreModule from './modules/core.js'

import ApplyRule from './atrules/apply/ApplyRule.js'
import Application from './atrules/apply/Application.js'

import ImportRule from './atrules/import/ImportRule.js'
import FileImport from './atrules/import/FileImport.js'
import ModuleImport from './atrules/import/ModuleImport.js'

import ComponentRule from './atrules/component/ComponentRule.js'
import Component from './atrules/component/Component.js'

import MakeRule from './atrules/make/MakeRule.js'
import Version from './atrules/make/Version.js'

import ThemeRule from './atrules/theme/ThemeRule.js'
import Theme from './atrules/theme/Theme.js'

import Stylesheet from './Stylesheet.js'
import Partial from './Partial.js'
// import DefaultTheme from './themes/default.js'

// import FileUtils from './utilities/FileUtils.js'
// import ImportUtils from './utilities/ImportUtils.js'
import CSSUtils from './utilities/CSSUtils.js'
import QueueUtils from './utilities/QueueUtils.js'

import { CONFIG } from '../index.js'

export default class Entry extends Stylesheet {
  #files

  // TODO: Possibly replace this object with a more robust manifest class
  #manifest = {
    applications: [],
    components: {},
    partials: [],
    modules: {
      internal: [],
      custom: {}
    },
    themes: {},
    versions: []
  }

  get manifest () {
    return this.#manifest
  }

  analyze (cb) {
    QueueUtils.run({
      tasks: [{
        name: '   |-- Registering Components',
        callback: this.#registerComponents
      }, {
        name: '   |-- Registering Themes',
        callback: this.#registerThemes
      }, {
        name: '   |-- Registering Versions',
        callback: this.#registerVersions
      // }, {
      //   name: '   |-- Registering Applications',
      //   callback: this.#registerApplications
      }]
    })
    .then(cb)
    .catch(cb)
  }

  render (cb) {
    let results = []

    QueueUtils.run({
      tasks: this.#manifest.versions.map(version => ({
        name: `   |-- Generating "${version.theme}" theme stylesheet`,
        callback: next => {
          let theme = this.#manifest.themes[version.theme]

          if (!theme) {
            return cb(version.error(`Theme "${version.theme}" not found`, { word: version.theme }))
          }

          let post = CONFIG.minify ? [cssnano] : [
            perfectionist(CONFIG.beautify),
            cleanup
          ]

          postcss([
            annotate,
            ...this.#getInternalModules(theme),
            // resolveFunctions({ functions: CONFIG.functions }),
            env(CONFIG.env),
            applyNamespace,
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

  #getInternalModules = theme => {
    let modules = []
    let { internal } = this.#manifest.modules

    if (internal.includes('constraints')) {
      modules.push(constraints)
    }

    if (internal.includes('modifiers')) {
      modules.push(modifiers)
    }

    modules.push(customProperties(theme, internal.includes('custom-properties')))

    if (internal.includes('reset')) {
      modules.push(reset)
    }

    modules.push(/*viewport, hoist, */charset(CONFIG.charset))

    return modules
  }

  #registerApplications = cb => {
    this.walkAtRules('apply', atrule => {
      console.log(atrule);
      let applyRule = new ApplyRule(atrule)

      let app = new Application(atrule)
      this.#manifest.applications.push(app)

      console.log(app);
    })

    // cb()
  }

  #registerComponents = cb => {
    let components = []
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

    components.forEach(component => {
      this.#manifest.components[component.name] = new Component(component)
    })

    extensions.sort((a, b) => {
      if (extensions.some(extension => extension.name === a.superclass)) {
        return 1
      }

      return 0
    }).forEach(extension => {
      let { superclass } = extension
      let parent = this.#manifest.components[superclass]

      if (!parent) {
        return cb(extension.error(`\nCannot extend non-existent component "${superclass}"`, { word: superclass }))
      }

      let component = new Component(extension, parent)
      parent.addExtension(component)
      this.#manifest.components[component.name] = component
    })

    cb()
  }

  #registerThemes = cb => {
    this.walkAtRules('theme', atrule => {
      let themeRule = new ThemeRule(atrule)
      let theme = new Theme(themeRule)

      this.#manifest.themes[themeRule.name] = theme
      themeRule.remove()
    })

    if (!this.#manifest.themes.hasOwnProperty('default')) {
      this.#manifest.themes.default = defaultTheme
    }

    cb()
  }

  #registerVersions = cb => {
    this.walkAtRules('make', atrule => {
      let makeRule = new MakeRule(atrule)
      this.#manifest.versions.push(new Version(makeRule, this.filepath))
      atrule.remove()
    })

    if (!this.#manifest.versions.some(version => version.theme === 'default')) {
      let defaultMakeRule = new MakeRule(CSSUtils.createAtRule({
        name: 'make',
        params: `default "${path.basename(this.filepath)}"`
      }))

      this.#manifest.versions.push(new Version(defaultMakeRule, this.filepath))
    }

    cb()
  }

  #resolveFileImport = (importRule, resolve, reject) => {
    let imp = new FileImport(importRule)

    if (!this.#canImport(imp.filepath)) {
      return reject(imp.error(`\nCircular Dependency`, { word: importRule.resource }))
    }

    imp.resolve((err, filepaths) => {
      if (err) {
        return reject(err)
      }

      filepaths.forEach(filepath => {
        let partial = new Partial(filepath, this)

        // TODO: Replace this with a more robust import store/manager
        this.#manifest.partials.push(partial)
        importRule.replaceWith(partial.clone())
      })

      resolve()
    })
  }

  #resolveModuleImport = (importRule, resolve, reject) => {
    let imp = new ModuleImport(importRule)

    if (imp.isInternal) {
      switch (imp.resource) {
        case '*':
          this.#manifest.modules.internal.push(...CoreModule)
          break

        default:
          this.#manifest.modules.internal.push(...imp.resource)
          break
      }
    } else {
      console.log('TODO: Support custom modules')
      // imp.resolve((err, funcs) => {
      //   if (err) {
      //     return reject(err)
      //   }
      //
      //   if (imp.isInternal) {
      //     this.#manifest.modules.internal = Object.assign(this.#manifest.modules.internal, funcs)
      //     importRule.remove()
      //     return resolve()
      //   }
      // })
    }

    importRule.remove()
    resolve()
  }

  // #generateThemedVersions = (resolve, reject) => QueueUtils.run({
  //   pad: {
  //     start: '    '
  //   },
  //
  //   tasks: Object.keys(this.#stylesheet.versions).map(theme => {
  //     let version = this.#stylesheet.versions[theme]
  //
  //     return {
  //       name: `Generating "${version.theme}" version`,
  //       callback: next => this.#generateThemedVersion(version, (err, result) => {
  //         if (err) {
  //           return reject(err)
  //         }
  //
  //         this.#files.push(result)
  //         next()
  //       })
  //     }
  //   })
  // })
  // .then(resolve)
  // .catch(reject)

  // #generateThemedVersion = (version, cb) => {
  //   let theme = NGN.coalesce(this.#stylesheet.themes[version.theme], DefaultTheme)
  //   let root = this.#stylesheet.clone()
  //   let outputpath = path.join(CONFIG.output, NGN.coalesce(version.filepath, `${path.basename(this.filepath, '.css')}${theme.name !== 'default' ? `.${theme.name}` : ''}.css`))
  //   let output
  //
  //   let post = []
  //
  //   if (CONFIG.minify) {
  //     post.push(cssnano())
  //   } else {
  //     post.push(perfectionist(CONFIG.beautify))
  //     post.push(cleanup)
  //   }
  //
  //   postcss([
  //     resolveFunctions({ functions: CONFIG.functions }),
  //     resolveAtRules(this.#stylesheet, theme),
  //     processThemeApplications(this.#stylesheet, theme),
  //     generateCore(this.#stylesheet, theme),
  //     env(CONFIG.env),
  //     applyNamespace,
  //     ...post
  //   ]).process(root, {
  //     from: this.filepath,
  //     to: outputpath,
  //     map: { inline: false }
  //   }).then(result => {
  //     output = {
  //       path: outputpath,
  //       css: result.css,
  //       map: result.map
  //     }
  //
  //     cb(null, output)
  //   }).catch(cb)
  // }
}
