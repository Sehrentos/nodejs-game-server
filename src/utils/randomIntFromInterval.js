/**
 * Returns a random integer number in the interval [min, max].
 * @param {number} min - The minimum value of the interval.
 * @param {number} max - The maximum value of the interval.
 * @returns {number} A random integer number in the interval [min, max].
 */
export function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}