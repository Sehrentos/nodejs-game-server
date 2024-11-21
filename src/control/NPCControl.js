import { randomBytes } from 'node:crypto';
import { NPC } from '../model/NPC.js';
import { updateNPCDialog } from '../Packets.js';

export class NPCControl extends NPC {
    /**
     * Creates a new NPCControl instance.
     * @param {import("../model/NPC.js").TNPCProps} p - NPC properties.
     */
    constructor(p) {
        super(p)
        this.gid = p?.gid ?? randomBytes(16).toString('hex')

        /** @type {string} - Dialog text */
        this.dialog = p?.dialog ?? ""
    }

    /**
     * Server update tick callback. Used to do animations etc.
     * 
     * @param {number} timestamp `performance.now()` from the world.onTick
     */
    onTick(timestamp) {
        // const deltaTime = timestamp - this.world.startTime // ms elapsed, since server started
        // console.log(`Entity ${this.name} (${startTime}/${deltaTime}) tick.`)

        // call AI onUpdate, if it exists
        // this.ai?.onUpdate(timestamp)

        // find entities in nearby
        // this.detectNearByEntities(6, timestamp)
    }

    /**
     * when player touches the NPC send the dialog to the player in socket as message
     * and make sure the player is near by the NPC, when interacting with the NPC.
     * Player can't move while interacting with the NPC
     * 
     * @param {import("./PlayerControl").PlayerControl} player 
     * @param {number} timestamp `performance.now()` when the player starts interacting
     */
    onTouch(player, timestamp) {
        if (player.nearByNPC.has(this.gid)) {
            console.log(`Player ${player.name} started interacting with NPC (${this.name} ${this.x},${this.y})`)
            player.canMove = false
            player.socket.send(JSON.stringify(updateNPCDialog(this.gid, this.dialog)))
        }
    }

    /**
     * Player stopped interacting with the NPC
     * 
     * @param {import("./PlayerControl").PlayerControl} player 
     * @param {number} timestamp `performance.now()` when the player stops interacting
     */
    onCloseDialog(player, timestamp) {
        console.log(`Player ${player.name} stopped interacting with NPC (${this.name} ${this.x},${this.y})`)
        player.canMove = true
    }

    // /**
    //  * Finds entities in the given radius around the entity.
    //  * @param {number} radius - The radius to search for entities.
    //  * @param {number} timestamp `performance.now()` from the world.onTick
    //  */
    // detectNearByEntities(radius, timestamp) {
    //     try {
    //         /** @type {import("./PlayerControl").PlayerControl[]} - The list of entities, but target only players and exclude itself  */
    //         // @ts-ignore filter by type = player
    //         const playersInRadius = this.map.findEntitiesInRadius(this.x, this.y, radius)
    //             .filter(entity => entity.gid !== this.gid && entity.type === ENTITY_TYPE.PLAYER)
    //         // none in radius
    //         if (playersInRadius.length === 0) {
    //             // check entities Map and set canMove to true
    //             // this.entities.forEach(entity => entity.canMove = true)
    //             return
    //         }
    //         // TODO 
    //     } catch (error) {
    //         console.error(`${this.constructor.name} ${this.gid} error:`, error.message || error || '[no-code]');
    //     }
    // }

    /**
     * Handles the action when the entity takes a hit from an attacker.
     * Reduces the entity's health points (hp) based on the attacker's
     * strength, attack power, and attack multiplier. If the entity's hp
     * falls to zero or below, the entity dies and is removed from the map.
     * 
     * @param {import("./MonsterControl").MonsterControl | import("./PlayerControl").PlayerControl} attacker - The attacking entity, containing attack
     *        attributes such as strength (str), attack
     *        power (atk), and attack multiplier (atkMultiplier).
     */
    takeDamage(attacker) {/* we don't take damage */ }
    die() {/* we don't die */ }
}