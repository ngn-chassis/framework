const ChassisViewportWidthRangeModel = require('./models/viewport-width-range.js')
const ChassisLayoutModel = require('./models/layout.js')
const ChassisTypographyModel = require('./models/typography.js')

class ChassisSettings extends NGN.EventEmitter {
	constructor (chassis) {
		super()

		let model = new NGN.DATA.Model({
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
						return chassis.utils.files.isDirectory(filepath)
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
						let filename = chassis.utils.files.getFileName(filepath)
						return chassis.utils.files.getFileExtension(filename) === '.css'
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
						selectors[list] = this.componentResetSelectors[list].map((selectorString) => {
							selectorString = `.chassis ${selectorString.trim()}`
							
							if (selectorString.includes(',')) {
								return selectorString.split(',').map((selector) => selector.trim()).join(', .chassis ')
							}
						
							return selectorString
						}).join(', ')
					}
					
					return selectors
				}
 			}
		})

		return new model()
	}
}

module.exports = ChassisSettings
