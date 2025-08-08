import Map1 from "./Map1.js";
import Map2 from "./Map2.js";
import Map3 from "./Map3.js";
import Map4 from "./Map4.js";
import Map5 from "./Map5.js";
import Map6 from "./Map6.js";
import Map7 from "./Map7.js";
import Mob1 from "./Mob1.js";
import Mob10 from "./Mob10.js";
import Mob11 from "./Mob11.js";
import Mob12 from "./Mob12.js";
import Mob13 from "./Mob13.js";
import Mob14 from "./Mob14.js";
import Mob15 from "./Mob15.js";
import Mob16 from "./Mob16.js";
import Mob2 from "./Mob2.js";
import Mob3 from "./Mob3.js";
import Mob4 from "./Mob4.js";
import Mob5 from "./Mob5.js";
import Mob6 from "./Mob6.js";
import Mob7 from "./Mob7.js";
import Mob8 from "./Mob8.js";
import Mob9 from "./Mob9.js";
import Npc1 from "./Npc1.js";
import Npc2 from "./Npc2.js";
import Npc3 from "./Npc3.js";
import Npc4 from "./Npc4.js";
import Player1 from "./Player1.js";

/**
 * Sprites data
 */
export const Sprites = {
	player: [
		Player1
	],
	map: [
		undefined, // ID:0 sprite does not exist
		Map1,
		Map2,
		Map3,
		Map4,
		Map5,
		Map6, // plain fields 1
		Map7, // plain fields 2
	],
	mob: [
		undefined, // ID:0 sprite does not exist
		Mob1,
		Mob2,
		Mob3,
		Mob4,
		Mob5,
		Mob6,
		Mob7,
		Mob8,
		Mob9,
		Mob10,
		Mob11,
		Mob12,
		Mob13,
		Mob14,
		Mob15,
		Mob16,
	],
	npc: [
		undefined, // ID:0 sprite does not exist
		Npc1,
		Npc2,
		Npc3,
		Npc4,
		Npc1, // Stranger use same sprite as townsfolk
	],
}
