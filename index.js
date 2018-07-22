require('ngn')
require('ngn-data')

const postcss = require('postcss')
const env = require('postcss-preset-env')

// const mergeAdjacentRules = require('postcss-merge-rules')
const removeComments = require('postcss-discard-comments')
const perfectionist = require('perfectionist')

const ChassisAtRules = require('./at-rules.js')
const ChassisConstants = require('./constants.js')
const ChassisCore = require('./core.js')
const ChassisFunctions = require('./functions.js')
const ChassisLayout = require('./layout.js')
const ChassisPost = require('./post.js')
const ChassisSettings = require('./settings.js')
const ChassisStyleSheet = require('./style-sheet.js')
const ChassisTheme = require('./theme.js')
const ChassisTypography = require('./typography.js')
const ChassisUtilities = require('./utilities.js')
const ChassisViewport = require('./viewport.js')

class Chassis {
  constructor (cfg) {
    this.utils = ChassisUtilities
    this.constants = ChassisConstants

    this.settings = new ChassisSettings(this)
		this.settings.load(NGN.coalesce(cfg, {}))
		this.settings.validate()

		this.typography = new ChassisTypography(this)
		this.settings.typography.ranges.load(this.typography.ranges)

		this.viewport = new ChassisViewport(this)
		this.settings.viewportWidthRanges.load(this.viewport.getWidthRanges(this.settings.layout.breakpoints))

		this.theme = new ChassisTheme(this)
		this.layout = new ChassisLayout(this)
		this.atRules = new ChassisAtRules(this)
		this.functions = new ChassisFunctions(this)
		this.post = new ChassisPost(this)
		this.core = new ChassisCore(this)

		this.componentExtensions = {}
		this.componentOverrides = {}
  }

  process (css, cb) {
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
      postcss([env(this.settings.envCfg)]).process(output).then(processed => {
        output = processed.css
        next()
      }, error => {
        console.log(error);
      })
    })

    tasks.add('Stripping Comments...', next => {
			output = removeComments.process(output.toString())
			next()
		})

    // tasks.add('Merging matching adjacent rules...', next => {
		// 	output = mergeAdjacentRules.process(output.toString())
		// 	next()
		// })

		tasks.add('Beautifying Output...', next => {
			output = perfectionist.process(output.toString())
			next()
		})

    tasks.on('taskstart', evt => console.log(evt.name))
    // tasks.on('taskcomplete', evt => console.log('Done.'))

    tasks.on('complete', () => cb(null, output.toString()))
    tasks.run(true)
  }
}

module.exports = Chassis
