const ChassisViewportWidthRangeModel = require('./models/viewport-width-range.js')
const ChassisLayoutModel = require('./models/layout.js')
const ChassisTypographyModel = require('./models/typography.js')

class ChassisSettings extends NGN.EventEmitter {
	constructor (chassis) {
		super()
		this.chassis = chassis

		let Model = new NGN.DATA.Model({
			relationships: {
				viewportWidthRanges: [new ChassisViewportWidthRangeModel(chassis)],
				layout: new ChassisLayoutModel(chassis),
				typography: new ChassisTypographyModel(chassis)
			},

			fields: {
				componentResetSelectors: {
					type: Object,
					default: {
						'inline': [],
						'inline-block': [],
						'block': []
					}
				},

				importBasePath: {
					type: String,
					default: './',
					validate (filepath) {
						return chassis.utils.file.isDirectory(filepath)
					}
				},

				plugins: {
					type: Array,
					default: []
				},

				theme: {
					type: String,
					default: chassis.constants.theme.defaultFilePath,
					validate (filepath) {
						let filename = chassis.utils.file.getFileName(filepath)
						return chassis.utils.file.getFileExtension(filename) === '.theme'
					}
				},

				legacy: {
					type: Boolean,
					default: true
				},

				zIndex: {
					type: Object,
					default: {
						min: -1000,
						behind: -1,
						default: 1,
						front: 2,
						max: 1000
					},

					validate (data) {
						return Object.keys(data).every(key => {
							return typeof data[key] === 'number'
								&& data[key] > (-2147483648)
								&& data[key] < 2147483647
						})
					}
				},

				zIndexStack: {
					type: Array,
					default: ['modal', 'drawer', 'dropdown-menu', 'overlay']
				}
			},

			virtuals: {
				componentResetSelectorLists () {
					let selectors = {}

					for (let list in this.componentResetSelectors) {
						selectors[list] = this.componentResetSelectors[list].map(selectorString => {
							selectorString = `.chassis ${selectorString.trim()}`

							if (selectorString.includes(',')) {
								return selectorString.split(',').map(selector => selector.trim()).join(', .chassis ')
							}

							return selectorString
						}).join(', ')
					}

					return selectors
				}
 			}
		})

		Object.defineProperties(this, {
			_model: NGN.privateconst(new Model()),

			_cleanseCfg: NGN.privateconst(cfg => {
				let { scale } = chassis.constants.typography

				this.envCfg = {
					stage: 0,
					features: {
						'custom-properties': {
							preserve: false
						}
					}
				}

				if (cfg.hasOwnProperty('componentResetSelectors')) {
					delete cfg.componentResetSelectors
				}

				if (cfg.hasOwnProperty('customProperties')) {
					if (typeof cfg.customProperties === 'boolean') {
						envCfg.features.customProperties = cfg.customProperties
					} else {
						envCfg.features.customProperties.variables = cfg.customProperties
					}

					delete cfg.customProperties
				}

				if (cfg.hasOwnProperty('typography')) {
					if (cfg.typography.hasOwnProperty('scaleRatio')) {
						switch (typeof cfg.typography.scaleRatio) {
							case 'string':
								if (scale.ratios.hasOwnProperty(cfg.typography.scaleRatio)) {
									cfg.typography.scaleRatio = scale.ratios[cfg.typography.scaleRatio]
								} else {
									console.error(`[ERROR] Chassis Typography: Scale Ratio "${cfg.typography.scaleRatio}" not found. Reverting to default...`)
									delete cfg.typography.scaleRatio
								}
								break;

							case 'number':
								if (cfg.typography.scaleRatio < 1 || cfg.typography.scaleRatio > 2) {
									console.warn(`[WARNING] Chassis Typography: In general, decimals between 1 and 2 work best for type scale ratios. The selected type scale ratio, ${cleansedCfg.typography.scaleRatio}, may produce undesirable results.`);
								}
								break;

							default:
								console.error(`[ERROR] Chassis Typography: Scale Ratio must be a decimal (ideally between 1 and 2) or a string. Reverting to default...`)
						}
					}
				}

				return cfg
			})
		})
	}

	get componentResetSelectors () {
		return this._model.componentResetSelectors
	}

	get componentResetSelectorLists () {
		return this._model.componentResetSelectorLists
	}

	get data () {
		return this._model.data
	}

	get importBasePath () {
		return this._model.importBasePath
	}

	get isValid () {
		return this._model.valid
	}

	get invalidAttributes () {
		return this._model.invalidDataAttributes
	}

	get layout () {
		return this._model.layout
	}

	get theme () {
		return this._model.theme
	}

	set theme (theme) {
		this._model.theme = theme
	}

	get typography () {
		return this._model.typography
	}

	get viewportWidthRanges () {
		return this._model.viewportWidthRanges
	}

	load (cfg) {
		cfg = this._cleanseCfg(cfg)
		this._model.load(cfg)
	}

	validate () {
		if (!this.isValid) {
			console.error('[ERROR] Chassis Configuration: Invalid fields:')
			console.error(this.invalidAttributes.join(', '))

			if (this.invalidAttributes.includes('theme')) {
				console.error(`[ERROR] Chassis Theme: "${this.theme}" is not a valid theme file. Chassis themes must have a ".theme" extension.`)
				this.theme = this.chassis.constants.theme.defaultFilePath
			}
		}
	}
}

module.exports = ChassisSettings
