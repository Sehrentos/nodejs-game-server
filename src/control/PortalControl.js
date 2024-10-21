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
        try {
            // const deltaTime = timestamp - this.world.startTime // ms elapsed, since server started
            // console.log(`Entity ${this.name} (${startTime}/${deltaTime}) tick.`)

            // send players to the map in 4 tiles radius
            const nearbyEntities = this.map.findEntitiesInRadius(this.x, this.y, 4)
            if (nearbyEntities.length === 0) return

            for (const entity of nearbyEntities) {
                // only players can be warped
                if (entity.type === ENTITY_TYPE.PLAYER) {
                    // TODO test, does this work
                    // player use portal again 5 seconds after last portal used
                    if (!entity.portalUsed || timestamp - entity.portalUsed > 5000) {
                        // warp player
                        entity.portalUsed = performance.now()
                        this.map.world.joinMapByName(entity, this.portalTo.name, this.portalTo.x, this.portalTo.y)
                    }
                }
            }
        } catch (error) {
            console.error(`WarpPortal ${this.gid} error:`, error.message || error || '[no-code]');
        }
    }

    // onCreate() {}

}