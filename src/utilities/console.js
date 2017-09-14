class ChassisConsoleUtils {
	/**
	 * @method printTree
	 * Print a prettified JSON respresentation of an object to console
	 */
	static printTree (tree) {
		console.log(JSON.stringify(tree, null, 2));
	}
}

module.exports = ChassisConsoleUtils
