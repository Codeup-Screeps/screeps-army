class Tower {
    constructor(tower) {
        this.tower = tower;
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
        // repair targets within range of tower
        const structureTargets = this.tower.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax && structure.hits < 150000 && structure.pos.getRangeTo(this.tower) < 20,
        });

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
