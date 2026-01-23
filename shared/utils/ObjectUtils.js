
/**
 * Checks if two array objects are equal
 * @param {Object[]} object1
 * @param {Object[]} object2
 * @returns {boolean}
 */
export function isArrayObjectEqual(
	object1,
	object2
) {
	return (
		object1.length === object2.length &&
		object1.every((element_1) =>
			object2.some((element_2) =>
				Object.keys(element_1).every((key) => element_1[key] === element_2[key])
			)
		)
	)
}

/**
 * Checks if two objects are equal.
 * @param {Object} object1 - The first object to compare.
 * @param {Object} object2 - The second object to compare.
 * @returns {boolean} True if all properties of the two objects are equal, false otherwise.
 */
export function isEqual(object1, object2) {
	// if either object is undefined or null, return false
	if (object1 == null || object2 == null) return false
	const keys = Object.keys(object1)
	if (keys.length !== Object.keys(object2).length) return false
	return keys.every((key) => object2[key] === object1[key])
}
