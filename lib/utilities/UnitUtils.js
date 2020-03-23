export default class UnitUtils {
	static pxToEm (px, root) {
		return px / root
	}

	static emToPx (em, root, round = true) {
		return em * root
	}
}
