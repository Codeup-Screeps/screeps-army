class Soldier {
    constructor(creep) {
        this.creep = creep;
    }
    run() {
        // Do soldier stuff
    }
    moveTo(
        target,
        options = {
            visualizePathStyle: { stroke: "#ffffff" },
            reusePath: 1,
        }
    ) {
        this.creep.moveTo(target, options);
    }
    clearFromExit() {
        // Check if the creep is at the border of a room
        if (this.creep.pos.x === 49 || this.creep.pos.x === 0 || this.creep.pos.y === 49 || this.creep.pos.y === 0) {
            this.creep.moveTo(new RoomPosition(25, 25, this.creep.room.name));
            return true;
        }
        return false;
    }
    resupplyExtensions() {
        // assist haulers by transferring energy from containers to extensions
        const extensions = this.creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_EXTENSION && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
        });
        // sort by closest
        extensions.sort((a, b) => this.creep.pos.getRangeTo(a) - this.creep.pos.getRangeTo(b));
        if (extensions.length > 0) {
            // if creep has energy at all, then transfer, otherwise collect
            if (this.creep.store.getUsedCapacity() > 0) {
                if (this.creep.transfer(extensions[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(extensions[0]);
                }
            } else {
                const collectingFromContainers = this.collectFromContainers();
                if (collectingFromContainers) {
                    return true;
                }
            }
            return true;
        } else {
            return false;
        }
    }
    resupplyTowers() {
        // assist haulers by transferring energy from containers to towers
        let towers = this.creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 200,
        });
        if (towers.length > 0) {
            // sort towers by energy level
            towers = towers.sort((a, b) => a.store.getFreeCapacity(RESOURCE_ENERGY) - b.store.getFreeCapacity(RESOURCE_ENERGY));
            if (this.creep.transfer(towers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(towers[0]);
                return true;
            }
        } else {
            return false;
        }
    }
    resupplySpawn() {
        const spawns = this.creep.room.find(FIND_MY_SPAWNS, {
            filter: (spawn) => spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
        });
        if (spawns.length > 0) {
            // Find the closest spawn
            const closestSpawn = this.creep.pos.findClosestByRange(spawns);

            // Try to transfer energy to the spawn. If it's not in range
            if (this.creep.transfer(closestSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                // Move to it
                this.moveTo(closestSpawn);
            }
            return true;
        } else {
            return false;
        }
    }
    resupplyContainer() {
        const containers = this.creep.room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
        });

        if (containers.length > 0) {
            const closestContainer = this.creep.pos.findClosestByPath(containers);
            if (this.creep.transfer(closestContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(closestContainer);
                return true; // Exit early if we're moving to a container or storage
            }
        } else {
            return false;
        }
    }
    resupplyStorage() {
        const storage = this.creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_STORAGE && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
        });
        if (storage.length > 0) {
            const closestStorage = this.creep.pos.findClosestByPath(storage);
            if (this.creep.transfer(closestStorage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(closestStorage);
                return true; // Exit early if we're moving to a container or storage
            }
        } else {
            return false;
        }
    }
    upgradeRC() {
        if (this.creep.upgradeController(this.creep.room.controller) == ERR_NOT_IN_RANGE) {
            // Move to it
            this.moveTo(this.creep.room.controller);
            return true;
        }
        return false;
    }
    collectGround(source) {
        let droppedEnergy = this.creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: (resource) => resource.resourceType == RESOURCE_ENERGY,
        });
        if (source) {
            droppedEnergy = droppedEnergy.filter((resource) => resource.pos.findInRange(FIND_SOURCES, 1, { filter: { id: source } }).length > 0);
        }
        if (droppedEnergy.length > 0) {
            let target;
            if (!source) {
                const spawn = this.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
                droppedEnergy = droppedEnergy.filter((resource) => spawn.pos.getRangeTo(resource) < 3);
            }
            if (droppedEnergy.length > 0) {
                // closest energy first
                let closestEnergy = this.creep.pos.findClosestByRange(droppedEnergy);
                // if it is more than what the creep can carry
                if (closestEnergy.amount > this.creep.store.getFreeCapacity()) {
                    target = closestEnergy;
                } else {
                    // largest energy first
                    droppedEnergy.sort((a, b) => b.amount - a.amount);
                    target = droppedEnergy[0];
                }
                const pickupResult = this.creep.pickup(target);
                if (pickupResult == ERR_NOT_IN_RANGE) {
                    this.moveTo(target);
                }
                if (pickupResult == OK && source) {
                    this.creep.memory.totalEnergyDelivered = (this.creep.memory.totalEnergyDelivered || 0) + target.amount;
                }
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    collectContainer() {
        const containers = this.creep.room.find(FIND_STRUCTURES, {
            filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > 0,
        });

        if (containers.length > 0) {
            const closestContainer = this.creep.pos.findClosestByPath(containers);
            if (this.creep.withdraw(closestContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.moveTo(closestContainer);
                return true; // Exit early if we're moving to a container or storage
            }
        }
        return false;
    }
    collectStorage() {
        const storage = this.creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0,
        });
        if (storage.length > 0) {
            const closestStorage = this.creep.pos.findClosestByPath(storage);
            if (this.creep.withdraw(closestStorage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.moveTo(closestStorage);
                return true; // Exit early if we're moving to a container or storage
            }
        }
        return false;
    }
}

export default Soldier;
