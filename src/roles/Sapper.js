import Soldier from "./Soldier";

class Sapper extends Soldier {
    constructor(creep) {
        super(creep.name);
        this.creep = creep;
    }
    run() {
        // Initialize harvester memory if not done
        if (this.creep.memory.settled === undefined) {
            this.creep.memory.settled = false;
        }

        // If the harvester is settled, try to harvest without moving
        if (this.creep.memory.settled) {
            // check if a container is within range 1
            const containers = this.creep.pos.findInRange(FIND_STRUCTURES, 2, {
                filter: (s) => s.structureType == STRUCTURE_CONTAINER,
            });
            if (containers.length > 0) {
                // if creep isn't on top of the container, move to it
                if (this.creep.pos.getRangeTo(containers[0]) > 0) {
                    this.creep.moveTo(containers[0]);
                }
            }
            const source = this.creep.pos.findClosestByRange(FIND_SOURCES);
            const harvestResult = this.creep.harvest(source);
            if (source && harvestResult == ERR_NOT_IN_RANGE) {
                // If no active source in range, unset the settled flag
                this.creep.memory.settled = false;
            }
            // save the total energy harvested
            if (harvestResult == OK) {
                this.creep.memory.totalEnergyHarvested = (this.creep.memory.totalEnergyHarvested || 0) + this.creep.getActiveBodyparts(WORK);
            }
            return; // Exit early to prevent movement
        }

        // Find sources in the room
        const sources = this.creep.room.find(FIND_SOURCES);

        // Filter sources based on the number of settled harvesters around them
        const availableSources = sources.filter((source) => {
            const positions = [
                [source.pos.x - 1, source.pos.y - 1],
                [source.pos.x, source.pos.y - 1],
                [source.pos.x + 1, source.pos.y - 1],
                [source.pos.x - 1, source.pos.y],
                [source.pos.x + 1, source.pos.y],
                [source.pos.x - 1, source.pos.y + 1],
                [source.pos.x, source.pos.y + 1],
                [source.pos.x + 1, source.pos.y + 1],
            ];

            let settledHarvesters = 0;

            for (let pos of positions) {
                const creepsAtPos = this.creep.room.lookForAt(LOOK_CREEPS, pos[0], pos[1]);
                for (let creepAtPos of creepsAtPos) {
                    if (creepAtPos.memory.settled && creepAtPos.memory.role === "sapper") {
                        settledHarvesters++;
                    }
                }
            }
            return settledHarvesters < 1; // Choose sources with fewer than this amount of settled harvesters
        });

        // Find the closest available source to the creep
        const closestAvailableSource = this.creep.pos.findClosestByRange(availableSources);

        if (closestAvailableSource) {
            const harvestResult = this.creep.harvest(closestAvailableSource);
            if (harvestResult == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(closestAvailableSource, {
                    visualizePathStyle: { stroke: "#ffaa00" },
                    reusePath: 10,
                });
            } else if (harvestResult == OK) {
                // add energy to any container within range 1
                const containers = this.creep.pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
                });
                if (containers.length > 0) {
                    const closestContainer = this.creep.pos.findClosestByPath(containers);
                    this.creep.transfer(closestContainer, RESOURCE_ENERGY);
                }
                // Check if the harvester is adjacent to the source
                if (this.creep.pos.isNearTo(closestAvailableSource.pos)) {
                    this.creep.memory.settled = true;
                }
            }
        }
    }
}

export default Sapper;
