export default class ConsoleUtils {
	/**
	 * @method printTree
	 * Print a prettified JSON respresentation of an object to console
	 */
	static printJSON (obj) {
		console.log(JSON.stringify(obj, null, 2));
	}
}
