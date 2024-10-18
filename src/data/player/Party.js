export class Party {
	/**
	 * Party constructor.
	 *
	 * @param {string} [name=""] - The party name.
	 * @param {number} [leader=0] - The party leader ID.
	 * @param {number[]} [members=[]] - The party members ID.
	 */
	constructor(name = "", leader = 0, members = []) {
		/** @type {string} - The party name. */
		this.name = name;
		/** @type {number} - The party leader ID. */
		this.leader = leader;
		/** @type {number[]} - The party members ID. */
		this.members = members;
	}
}