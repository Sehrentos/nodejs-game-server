/**
 * Helper to get conditional value from object. Useful when you have many conditions or complex logic.
 * @param {*} target 
 * @param {[string,number,any][]} params Array<[property, srcValue, setValue]>
 * @param {*} defaultValue optional default value to return as fallback
 * 
 * @example const type = getWhen(entity, [
 *   ["type", ENTITY_TYPE.MONSTER, 0]
 *   ["type", ENTITY_TYPE.PLAYER, Const.PLAYER_BASE_HP_REGEN]
 * ], 0)
 * // equivalent to:
 * const type = entity.type === ENTITY_TYPE.MONSTER ? 0 
 * : (entity.type === ENTITY_TYPE.PLAYER) ? Const.PLAYER_BASE_HP_REGEN 
 * : 0;
 * }
 * 
 * @example const damage = getWhen(entity, [
 *   ["type", ENTITY_TYPE.MONSTER, 10],
 *   ["type", ENTITY_TYPE.PLAYER, 5],
 *   ["type", ENTITY_TYPE.NPC, 2],
 *   ["isBoss", true, 20], // Add more conditions easily
 * ], 1);
 */
export function getWhen(target, params, defaultValue) {
    for (const [key, srcValue, setValue] of params) {
        if (target[key] === srcValue) {
            return setValue;
        }
    }
    return defaultValue;
}

/**
 * Helper to set conditional value to object. Useful when you have many conditions or complex logic.
 * @param {*} target 
 * @param {[string,number,any][]} params Array<[property, srcValue, setValue]>
 * @returns {boolean} `true` when value was set, `false` otherwise.
 * 
 * @example setWhen(entity, [
 *   ["type", ENTITY_TYPE.MONSTER, 0]
 *   ["type", ENTITY_TYPE.PLAYER, Const.PLAYER_BASE_HP_REGEN]
 * ])
 * // equivalent to:
 * if (entity.type === ENTITY_TYPE.MONSTER) {
 *   entity.type = 0
 * } else if (entity.type === ENTITY_TYPE.PLAYER) {
 * 	 entity.type = Const.PLAYER_BASE_HP_REGEN
 * }
 */
export function setWhen(target, params) {
    for (const [key, srcValue, setValue] of params) {
        if (target[key] === srcValue) {
            target[key] = setValue;
            return true;
        }
    }
    return false;
}
