class ChassisTypographyModel {
  constructor (chassis) {
    let fontSizeModel = new NGN.DATA.Model({
			fields: {
				headings: {
					type: Object,
					default: {
						'1': 'larger',
						'2': 'large',
						'3': 'root',
						'4': 'small',
						'5': 'small',
						'6': 'small'
					},
					validate (data) {
						let mh = new MustHave()

						if (!mh.hasExactly(data, '1', '2', '3', '4', '5', '6')) {
							return false
						}

						return Object.keys(data).every(key => {
							return typeof data[key] === 'string'
						})
					}
				},
				formLegend: {
					type: String,
					default: 'large'
				}
			}
		})

		let rangeModel = new NGN.DATA.Model({
			fields: {
				bounds: {
					type: Object,
					validate (data) {
						// TODO: Add validation

						return true
					}
				},
				typography: {
					type: Object
				}
			}
		})

    return new NGN.DATA.Model({
			relationships: {
				fontSizes: fontSizeModel,
				ranges: [rangeModel]
			},

			fields: {
				baseFontSize: {
					type: Number,
					default: 16,
					min: 1
				},
				scaleRatio: {
					type: Number,
					default: chassis.constants.typography.scale.ratios['golden ratio'],
					min: 0
				},
				fontWeights: {
					type: Object,
					default: {
						thin: 100,
						light: 300,
						regular: 400,
						semibold: 500,
						bold: 700,
						ultra: 900
					},
					validate (data) {
						let legitimateValues = ['normal', 'bold', 'lighter', 'bolder', '100', '200', '300', '400', '500', '600', '700', '800', '900']

						return Object.keys(data).every(key => {
							return legitimateValues.includes(data[key].toString().trim().toLowerCase())
						})
					}
				}
			}
		})
  }
}

module.exports = ChassisTypographyModel
