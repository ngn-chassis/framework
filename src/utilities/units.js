class ChassisUnitUtils {
	static toEms (pxValue, root) {
		return pxValue / root
	}

	static toPx (emValue, root, round = true) {
		return emValue * root
	}

	static precisionRound (number, precision = 1) {
	  let factor = Math.pow(10, precision);
	  return Math.round(number * factor) / factor;
	}
}

module.exports = ChassisUnitUtils
