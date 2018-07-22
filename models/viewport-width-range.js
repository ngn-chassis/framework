class ChassisViewportWidthRangeModel {
  constructor (chassis) {
    return new NGN.DATA.Model({
			fields: {
				name: {
					type: String,
					pattern: /^\S*$/gi
				},
				lowerBound: {
					type: Number,
					validate (value) {
						return value < this.upperBound
					}
				},
				upperBound: {
					type: Number,
					validate (value) {
						return value > this.lowerBound
					}
				}
			}
		})
  }
}

module.exports = ChassisViewportWidthRangeModel
