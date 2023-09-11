class Tower {
    constructor(tower) {
        this.tower = tower;
        this.storageEnergy = this.tower.room.storage.store[RESOURCE_ENERGY];
    }

    run() {
        // attack hostiles
        const target = this.tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (target) {
            this.tower.attack(target);
            return;
        }

        // heal friendlies
        const friendlyTarget = this.tower.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: (creep) => creep.hits < creep.hitsMax,
        });
        if (friendlyTarget) {
            this.tower.heal(friendlyTarget);
            return;
        }

        // repair structures
        let structureTargets = this.tower.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 200000,
        });
        // if abundant energy, repair ramparts/walls fully
        if (this.storageEnergy > 100000) {
            structureTargets = this.tower.room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax,
            });
        }

        // sort by hits
        structureTargets.sort((a, b) => a.hits - b.hits);
        const structureTarget = structureTargets[0];
        if (structureTarget) {
            this.tower.repair(structureTarget);
            return;
        }
    }
}

export default Tower;
