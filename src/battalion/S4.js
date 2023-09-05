class BattalionS4 {
    /* (Logistics): Manages supply chains and maintenance.
     * Handle resource flow, storage, and building/repair operations.
     */
    constructor(battalion) {
        this.battalion = battalion;
    }
    run() {
        // Do S4 stuff
        this.sendBuilders();
    }
    sendBuilders() {
        // if there is a room with a spawn construction site
        const spawnConstructionSites = Object.values(Game.constructionSites).filter((site) => site.structureType === STRUCTURE_SPAWN);
        if (spawnConstructionSites.length > 0) {
            // check if room has a builder
            const builders = Object.values(Game.creeps).filter((creep) => creep.memory.role === "engineer" && creep.memory.specialJob === spawnConstructionSites[0].id);
            // console.log(`Found ${builders.length} special builders`);
            if (builders.length === 0) {
                // if not, send one
                const availableSpawns = this.battalion.spawns.filter((spawn) => !spawn.spawning);
                if (availableSpawns.length === 0) {
                    return;
                }
                if (availableSpawns[0].room.energyAvailable < 300) {
                    return;
                }
                // Recruit a new Engineer
                this.battalion.companies.find((company) => company.name === availableSpawns[0].room.name).s1.recruit("engineer", spawnConstructionSites[0].id);
            }
        }
    }
}

export default BattalionS4;
