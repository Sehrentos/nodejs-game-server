import { randomBytes } from 'node:crypto';
import { Portal } from '../model/Portal.js';
import { ENTITY_TYPE } from '../enum/Entity.js';

export class PortalControl extends Portal {
    /**
     * Creates a new EntityControl instance.
     * @param {import("../model/Portal.js").TPortalProps} p - Entity properties.
     */
    constructor(p) {
        super(p)
        this.gid = p?.gid ?? randomBytes(16).toString('hex')
    }

    /**
     * Server update tick callback. Used to do animations etc.
     * 
     * @param {number} timestamp `performance.now()` from the world.onTick
     */
    onTick(timestamp) {
        // send nearby players to the next map
        this.detectNearByEntities(4, timestamp)
    }

    /**
     * Finds entities in the given radius around the entity.
     * @param {number} radius - The radius to search for entities.
     * @param {number} timestamp `performance.now()` from the world.onTick
     */
    detectNearByEntities(radius, timestamp) {
        try {
            const nearbyEntities = this.map.findEntitiesInRadius(this.x, this.y, radius)

            if (nearbyEntities.length === 0) return

            for (const entity of nearbyEntities) {
                // only players can be warped
                if (entity.type === ENTITY_TYPE.PLAYER) {
                    // @ts-ignore player use portal again 5 seconds after last portal used
                    if (!entity._portalUsed || timestamp - entity._portalUsed > 5000) {
                        // @ts-ignore warp player
                        entity._portalUsed = timestamp || performance.now()
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