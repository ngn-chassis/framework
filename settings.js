const ChassisViewportWidthRangeModel = require('./models/viewport-width-range.js')
const ChassisLayoutModel = require('./models/layout.js')
const ChassisTypographyModel = require('./models/typography.js')

module.exports = (function () {
	let _private = new WeakMap()

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

			_private.set(this, {
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
		}

		get componentResetSelectors () {
			return _private.get(this).model.componentResetSelectors
		}

		get componentResetSelectorLists () {
			return _private.get(this).model.componentResetSelectorLists
		}

		get data () {
			return _private.get(this).model.data
		}

		get importBasePath () {
			return _private.get(this).model.importBasePath
		}

		get isValid () {
			return _private.get(this).model.valid
		}

		get invalidAttributes () {
			return _private.get(this).model.invalidDataAttributes
		}

		get layout () {
			return _private.get(this).model.layout
		}

		get minify () {
			return _private.get(this).model.minify
		}

		get sourceMap () {
			return _private.get(this).model.sourceMap
		}

		get sourceMapPath () {
			return _private.get(this).model.sourceMapPath
		}

		get theme () {
			return _private.get(this).model.theme
		}

		set theme (theme) {
			_private.get(this).model.theme = theme
		}

		get typography () {
			return _private.get(this).model.typography
		}

		get viewportWidthRanges () {
			return _private.get(this).model.viewportWidthRanges
		}

		load (cfg) {
			cfg = _private.get(this).cleanseCfg(cfg)
			_private.get(this).model.load(cfg)
		}

		validate () {
			if (!this.isValid) {
				console.error('[ERROR] Chassis Configuration: Invalid fields:')
				console.error(this.invalidAttributes.join(', '))

				if (this.invalidAttributes.includes('theme')) {
					console.error(`[ERROR] Chassis Theme: "${this.theme}" is not a valid theme file. Chassis themes must have a ".theme" extension.`)
					this.theme = _private.get(this).chassis.constants.theme.defaultFilePath
				}
			}
		}
	}
})()
