const ChassisViewportWidthRangeModel = require('./data/models/viewport-width-range.js')
const ChassisLayoutModel = require('./data/models/layout.js')
const ChassisTypographyModel = require('./data/models/typography.js')

module.exports = (function () {
	let _ = new WeakMap()

	return class extends NGN.EventEmitter {
		constructor (chassis) {
			super()

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
						default: null,
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

					minify: {
						type: Boolean,
						default: false
					},

					sourceMap: {
						type: Boolean,
						default: false
					},

					sourceMapPath: {
						type: String,
						default: null
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

			_.set(this, {
				chassis,

				model: new Model(),

				cleanseCfg: cfg => {
					let { scale } = chassis.constants.typography

					// TODO: Make this configurable
					this.envCfg = {
						stage: 0,
						features: {
							'custom-properties': {
								preserve: false
							},
							'color-mod-function': {
								unresolved: 'warn'
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
				}
			})

			_.get(this).model.on('load', evt => this.emit('load'))
		}

		get componentResetSelectors () {
			return _.get(this).model.componentResetSelectors
		}

		get componentResetSelectorLists () {
			return _.get(this).model.componentResetSelectorLists
		}

		get data () {
			return _.get(this).model.data
		}

		get importBasePath () {
			return _.get(this).model.importBasePath
		}

		set importBasePath (path) {
			_.get(this).model.importBasePath = path
		}

		get isValid () {
			return _.get(this).model.valid
		}

		get invalidAttributes () {
			return _.get(this).model.invalidDataAttributes
		}

		get layout () {
			return _.get(this).model.layout
		}

		get minify () {
			return _.get(this).model.minify
		}

		get sourceMap () {
			return _.get(this).model.sourceMap
		}

		get sourceMapPath () {
			return _.get(this).model.sourceMapPath
		}

		get theme () {
			return _.get(this).model.theme
		}

		set theme (theme) {
			_.get(this).model.theme = theme
		}

		get typography () {
			return _.get(this).model.typography
		}

		get viewportWidthRanges () {
			return _.get(this).model.viewportWidthRanges
		}

		load (cfg) {
			let {
				cleanseCfg,
				model
			} = _.get(this)

			model.load(cleanseCfg(cfg))
		}

		validate () {
			if (!this.isValid) {
				return this.emit('validation.failed', this.invalidAttributes)
			}

			this.emit('validation.succeeded')
		}
	}
})()
