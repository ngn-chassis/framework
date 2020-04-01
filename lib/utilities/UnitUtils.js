import Config from '../data/Config.js'

export default class UnitUtils {
	static pxToRelative (px, root = Config.typography.fontSize.min) {
		return px / root
	}

	static emToRelative (em, root = Config.typography.fontSize.min) {
		return em * root
	}
}
