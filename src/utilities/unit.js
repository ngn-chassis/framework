class ChassisUnitUtils {
	static pxToEm (pxValue, root) {
		return pxValue / root
	}

	static emToPx (emValue, root, round = true) {
		return emValue * root
	}
}

module.exports = ChassisUnitUtils
