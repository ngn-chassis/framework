require('ngn')
require('ngn-data')

const postcss = require('postcss')
const cssnext = require('postcss-cssnext')
// const mergeAdjacentRules = require('postcss-merge-rules')
const removeComments = require('postcss-discard-comments')
const perfectionist = require('perfectionist')

const ChassisAtRules = require('./at-rules.js')
const ChassisConstants = require('./constants.js')
const ChassisCore = require('./core.js')
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
		this.post = new ChassisPost(this)
		this.core = new ChassisCore(this)
		this.componentExtensions = {}

		this.componentOverrides = {}

		// this.utils.console.printTree(this.settings.data)
		// this.utils.console.printTree(this.theme.json)
		return (root, result) => {
			let skip = !root.some((node) => {
				return node.type === 'atrule' && node.name === 'chassis' && node.params === 'init'
			})

			let input = new ChassisStyleSheet(this, root).css
			let output = skip ? input : this.core.css.append(input)

			// Post-processing
			output.walkAtRules('chassis-post', (atRule) => {
				let data = Object.assign({
					root: this.tree,
					atRule
				}, this.atRules.getProperties(atRule))

				this.post.process(data)
			})

			output = cssnext(this.settings.cssnextCfg).process(output.toString())
			output = removeComments.process(output.toString())
			// output = mergeAdjacentRules.process(output.toString())
			output = perfectionist.process(output.toString())

			result.root = postcss.parse(output)
		}
	}
}

module.exports = Chassis
