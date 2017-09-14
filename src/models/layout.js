class ChassisLayoutModel {
  constructor (chassis) {
    return new NGN.DATA.Model({
			fields: {
				breakpoints: {
					type: String,
					default: '320 tiny 512 small 768 medium 1024 large 1200 huge 1440 massive 1600'
				},
				gutter: {
					type: String,
					default: '6.18vw',
					pattern: /^(auto|0)$|^[0-9]+.?([0-9]+)?(px|em|ex|%|in|cm|mm|pt|pc|vw|vh|rem)$/gi
				},
				minWidth: {
					type: Number,
					default: chassis.constants.layout.viewport.minWidth,
					min: 0
				},
				maxWidth: {
					type: Number,
					default: chassis.constants.layout.viewport.maxWidth,
					min: 0
				}
			}
		})
  }
}

module.exports = ChassisLayoutModel
