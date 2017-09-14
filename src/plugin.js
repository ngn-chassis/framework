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

class ChassisPostCss {
	constructor (cfg) {
		this.utils = ChassisUtilities
		this.constants = ChassisConstants
		
		cfg = this._cleanseCfg(NGN.coalesce(cfg, {}))

		this.settings = new ChassisSettings(this)
		this.settings.load(cfg)

		this._validateSettings()

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

		// List of CSS properties that are applied to <a> tags. Other components that
		// use <a> tags with an additional class or attribute will need to unset or
		// override these properties to avoid picking up unintended styling from
		// default links.
		this.linkOverrides = {}

		return this.plugin
	}

	get plugin () {
		// this.utils.console.printTree(this.settings.data)
		// this.utils.console.printTree(this.theme.json)
		return (root, result) => {
			let output = this.core.css.append(new ChassisStyleSheet(this, root).css)
			
			output.walkAtRules('chassis-post', (atRule) => {
				let data = Object.assign({
					root: this.tree,
					atRule
				}, this.atRules.getProperties(atRule))
				
				this.post.process(data)
			})

			output = cssnext(this.cssnextCfg).process(output.toString())
			output = removeComments.process(output.toString())
			// output = mergeAdjacentRules.process(output.toString())
			output = perfectionist.process(output.toString())

			result.root = postcss.parse(output)
		}
	}

	_cleanseCfg (cfg) {
		let { scale } = this.constants.typography
		let cleansedCfg = cfg

		this.cssnextCfg = {
			features: {
				// autoprefixer: false,
				customProperties: {
					variables: {}
				}
			}
		}

		if (cleansedCfg.hasOwnProperty('componentResetSelectors')) {
			delete cleansedCfg.componentResetSelectors
		}

		if (cleansedCfg.hasOwnProperty('customProperties')) {
			if (typeof cleansedCfg.customProperties === 'boolean') {
				this.cssnextCfg.features.customProperties = cleansedCfg.customProperties
			} else {
				this.cssnextCfg.features.customProperties.variables = cleansedCfg.customProperties
			}

			delete cleansedCfg.customProperties
		}
		
		if (cleansedCfg.hasOwnProperty('typography')) {
			if (cleansedCfg.typography.hasOwnProperty('scaleRatio')) {
				switch (typeof cleansedCfg.typography.scaleRatio) {
					case 'string':
						if (scale.ratios.hasOwnProperty(cleansedCfg.typography.scaleRatio)) {
							cleansedCfg.typography.scaleRatio = scale.ratios[cleansedCfg.typography.scaleRatio]
						} else {
							console.error(`[ERROR] Chassis Typography: Scale Ratio "${cleansedCfg.typography.scaleRatio}" not found. Reverting to default...`)
							delete cleansedCfg.typography.scaleRatio
						}
						break;
						
					case 'number':
						if (cleansedCfg.typography.scaleRatio < 1 || cleansedCfg.typography.scaleRatio > 2) {
							console.warn(`[WARNING] Chassis Typography: In general, decimals between 1 and 2 work best for type scale ratios. The selected type scale ratio, ${cleansedCfg.typography.scaleRatio}, may produce undesirable results.`);
						}
						break;
						
					default:
						console.error(`[ERROR] Chassis Typography: Scale Ratio must be a decimal (ideally between 1 and 2) or a string. Reverting to default...`)
				}
			}
		}

		return cleansedCfg
	}

	_validateSettings () {
		if (!this.settings.valid) {
			console.error('[ERROR] Chassis Configuration: Invalid fields:')
			console.error(this.settings.invalidDataAttributes.join(', '))

			if (this.settings.invalidDataAttributes.includes('theme')) {
				console.error(`[ERROR] "${this.settings.theme}" is not a valid theme file. Chassis themes must have a ".css" or ".js" extension. Reverting to default theme...`)
				this.settings.theme = this.constants.theme.defaultFilePath
			}
		}
	}
}

module.exports = ChassisPostCss
