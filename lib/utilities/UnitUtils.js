import Config from '../data/Config.js'

export default class UnitUtils {
	static pxToRelative (px, root = Config.typography.baseFontSize) {
		return px / root
	}

	static emToRelative (em, root = Config.typography.baseFontSize) {
		return em * root
	}
}
