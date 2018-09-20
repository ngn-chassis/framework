require('ngn')
require('ngn-data')

let postcss = require('postcss')
let env = require('postcss-preset-env')

// const mergeAdjacentRules = require('postcss-merge-rules')
let removeComments = require('postcss-discard-comments')
let perfectionist = require('perfectionist')
let CleanCss = require('clean-css')

const ChassisStyleSheet = require('./style-sheet.js')

module.exports = class Chassis {
  constructor (cfg) {
    this.utils = require('./utilities.js')
    this.constants = require('./constants.js')

    this.settings = new (require('./settings.js'))(this)
		this.settings.load(NGN.coalesce(cfg, {}))
		this.settings.validate()

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

  process (css, cb, from = void 0) {
    let root = postcss.parse(css)
    let input, output

    let tasks = new NGN.Tasks()

    tasks.add('Initializing Chassis Style Sheet...', next => {
			let initialized = root.some(node => {
				return node.type === 'atrule' && node.name === 'chassis' && node.params === 'init'
			})

			input = new ChassisStyleSheet(this, root).css
			output = initialized ? this.core.css.append(input) : input

			next()
		})

    tasks.add('Running post-processing routines...', next => {
			output.walkAtRules('chassis-post', atRule => {
				let data = Object.assign({
					root: this.tree,
					atRule
				}, this.atRules.getProperties(atRule))

				this.post.process(data)
			})

			next()
		})

    tasks.add('Processing CSS4 syntax...', next => {
      env.process(output, {from}, this.settings.envCfg).then(processed => {
        this.utils.console.printTree(processed);
        output = processed.css
        next()
      }, cb)
    })

    tasks.add('Cleaning up...', next => {
      output = postcss.parse(output)

      output.walkRules(rule => {
				if (rule.nodes.length === 0) {
					rule.remove()
					return
				}
			})

      next()
    })

    tasks.add('Stripping comments...', next => {
			output = removeComments.process(output.toString())
			next()
		})

    // tasks.add('Merging matching adjacent rules...', next => {
		// 	output = mergeAdjacentRules.process(output.toString())
		// 	next()
		// })

		tasks.add('Beautifying output...', next => {
			output = perfectionist.process(output.toString())
			next()
		})

    // tasks.on('taskstart', evt => console.log(evt.name))
    // tasks.on('taskcomplete', evt => console.log('Done.'))

    tasks.on('complete', () => cb(null, output.toString()))
    tasks.run(true)
  }

  minify (css, sourceMap = false) {
    return new CleanCss({sourceMap}).minify(css)
  }
}
