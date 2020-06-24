module.exports = class ChassisMathUtils {
	static precisionRound (number, precision = 1) {
		let shift = (number, precision, reverseShift) => {
			if (reverseShift) {
				precision = -precision
			}

			let arr = `${number}`.split('e')

			return +(`${arr[0]}e${arr[1] ? (+arr[1] + precision) : precision}`)
		}

		return shift(Math.round(shift(number, precision, false)), precision, true)
	}
}
