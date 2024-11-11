/**
 * Checks if the given coordinates (x, y) are within the range of the given entity.
 * The range is defined as the absolute difference between the entity's position and the given coordinates.
 * @param {import("../model/Entity").TEntityProps} entity - The entity to check against.
 * @param {number} x - The x-coordinate of the point to check.
 * @param {number} y - The y-coordinate of the point to check.
 * @param {number} range - The range to check against.
 * @returns {boolean} True if the coordinates are within the range of the entity, otherwise false.
 */
export function inRangeOfEntity(entity, x, y, range) {
    return Math.abs(entity.x - x) <= range && Math.abs(entity.y - y) <= range
}