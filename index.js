require('ngn')
require('ngn-data')

const EventEmitter = require('events')

let postcss = require('postcss')
let env = require('postcss-preset-env')

// const mergeAdjacentRules = require('postcss-merge-rules')
let removeComments = require('postcss-discard-comments')
let perfectionist = require('perfectionist')
let CleanCss = require('clean-css')

const ChassisStyleSheet = require('./style-sheet.js')

module.exports = (function () {
  let _private = new WeakMap()

  return class Chassis extends EventEmitter {
    constructor (cfg = null) {
      super()

      _private.set(this, {
        sourceMap: null,

        processCfg: cfg => {
      		this.settings.load(NGN.coalesce(cfg, {}))
      		this.settings.validate()
        }
      })

      this.utils = require('./utilities.js')
      this.constants = require('./constants.js')

      this.settings = new (require('./settings.js'))(this)
      _private.get(this).processCfg(cfg)

  		this.typography = new (require('./typography.js'))(this)
  		this.settings.typography.ranges.load(this.typography.ranges)

  		this.viewport = new (require('./viewport.js'))(this)
  		this.settings.viewportWidthRanges.load(this.viewport.getWidthRanges(this.settings.layout.breakpoints))

  		this.theme = new (require('./theme.js'))(this)
  		this.layout = new (require('./layout.js'))(this)
  		this.atRules = new (require('./at-rules.js'))(this)
  		this.functions = new (require('./functions.js'))(this)
  		this.post = new (require('./post.js'))(this)
  		this.core = new (require('./core.js'))(this)

  		this.componentExtensions = {}
  		this.componentOverrides = {}
    }

    get cfg () {
      return this.settings.data
    }

    set cfg (cfg) {
      _private.get(this).processCfg(cfg)
      this.settings.typography.ranges.reload(this.typography.ranges)
      this.settings.viewportWidthRanges.reload(this.viewport.getWidthRanges(this.settings.layout.breakpoints))
    }

    process (css, cb, from = void 0) {
      let root = postcss.parse(css)
      let input, output

      let tasks = new NGN.Tasks()

      tasks.add('Initializing Chassis style sheet', next => {
  			let initialized = root.some(node => {
  				return node.type === 'atrule' && node.name === 'chassis' && node.params === 'init'
  			})

  			input = new ChassisStyleSheet(this, root).css
  			output = initialized ? this.core.css.append(input) : input

  			next()
  		})

      tasks.add('Running post-processing routines', next => {
  			output.walkAtRules('chassis-post', atRule => {
  				let data = Object.assign({
  					root: this.tree,
  					atRule
  				}, this.atRules.getProperties(atRule))

  				this.post.process(data)
  			})

  			next()
  		})

      tasks.add('Processing CSS4 syntax', next => {
        env.process(output, {from}, this.settings.envCfg).then(processed => {
          output = processed.css
          next()
        }, cb)
      })

      tasks.add('Cleaning Up', next => {
        output = postcss.parse(output)

        output.walkRules(rule => {
  				if (rule.nodes.length === 0) {
  					rule.remove()
  					return
  				}
  			})

        next()
      })

      tasks.add('Stripping Comments', next => {
  			output = removeComments.process(output.toString())
  			next()
  		})

      // tasks.add('Merging matching adjacent rules...', next => {
  		// 	output = mergeAdjacentRules.process(output.toString())
  		// 	next()
  		// })

      if (this.settings.minify) {
        let minified

        tasks.add('Minifying Output', next => {
          minified = this.minify(output.toString(), this.settings.sourceMap)
    			output = minified.styles
    			next()
    		})

        if (this.settings.sourceMap) {
          tasks.add('Generating source map', next => {
            this.sourceMap = minified.sourceMap.toString()
            next()
          })
        }
      } else {
        tasks.add('Beautifying Output', next => {
    			output = perfectionist.process(output.toString()).toString()
    			next()
    		})
      }

      tasks.on('taskstart', evt => this.emit('taskstart', evt))
      tasks.on('taskcomplete', evt => this.emit('taskcomplete', evt))

      tasks.on('complete', () => cb(null, {
        css: output,
        sourceMap: this.sourceMap
      }))

      tasks.run(true)
    }

    minify (css, sourceMap = false) {
      return new CleanCss({sourceMap}).minify(css)
    }
  }
})()
