class ChassisMathUtils {
	static precisionRound (number, precision = 1) {
	  let factor = Math.pow(10, precision);
	  return Math.round(number * factor) / factor;
	}
}

module.exports = ChassisMathUtils
