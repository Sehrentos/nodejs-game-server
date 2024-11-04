import { randomBytes } from 'node:crypto';
import { Portal } from '../model/Portal.js';
import { ENTITY_TYPE } from '../enum/Entity.js';

export class PortalControl extends Portal {
    /**
     * Creates a new EntityControl instance.
     * @param {import("../model/Portal.js").PortalProps} p - Entity properties.
     */
    constructor(p = {}) {
        super(p)
        this.gid = p?.gid ?? randomBytes(16).toString('hex')
        this.portalTo = p?.portalTo ?? null
    }

    /**
     * Function to handle the movement of a monster entity on each tick.
     * It checks if the entity can move, updates its position based on speed and direction,
     * and ensures it stays within the map boundaries and doesn't move excessively from the original position.
     * 
     * @param {number} timestamp `performance.now()` from the world.onTick
     */
    async onTick(timestamp) {
        // const deltaTime = timestamp - this.world.startTime // ms elapsed, since server started
        // console.log(`Entity ${this.name} (${startTime}/${deltaTime}) tick.`)

        // send players to the map in 4 tiles radius
        this.detectNearByEntities(4, timestamp)
    }

    /**
     * Finds entities in the given radius around the entity.
     * @param {number} [radius=4] - The radius to search for entities.
     * @param {number} [timestamp=performance.now()] `performance.now()` from the world.onTick
     */
    detectNearByEntities(radius = 4, timestamp = performance.now()) {
        try {
            // find entities in 4 tiles radius
            const nearbyEntities = this.map.findEntitiesInRadius(this.x, this.y, radius)
            if (nearbyEntities.length === 0) return
            for (const entity of nearbyEntities) {
                // only players can be warped
                if (entity.type === ENTITY_TYPE.PLAYER) {
                    // @ts-ignore player use portal again 5 seconds after last portal used
                    if (!entity._portalUsed || timestamp - entity._portalUsed > 5000) {
                        // @ts-ignore warp player
                        entity._portalUsed = performance.now()
                        // @ts-ignore entity type is player
                        this.map.world.joinMapByName(entity, this.portalTo.name, this.portalTo.x, this.portalTo.y)
                    }
                }
            }
        } catch (error) {
            console.error(`${this.constructor.name} ${this.gid} error:`, error.message || error || '[no-code]');
        }
    }

    takeDamage(attacker) { /* we don't take damage */ }
    die() { /* we don't die */ }
}