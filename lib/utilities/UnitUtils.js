import { CONFIG } from '../../index.js'

export default class UnitUtils {
	static pxToRelative (px, root = CONFIG.typography.baseFontSize) {
		return px / root
	}

	static emToRelative (em, root = CONFIG.typography.baseFontSize) {
		return em * root
	}
}
