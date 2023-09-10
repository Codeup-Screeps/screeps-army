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
                    this.creep.moveTo(extensions[0], { reusePath: 2 });
                }
            } else {
                const collectingFromContainers = this.collectContainer();
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
            return true;
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
        let containers = this.creep.room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
        });
        // filter out source containers
        const sources = this.creep.room.find(FIND_SOURCES);
        containers = containers.filter((container) => {
            for (let source of sources) {
                if (container.pos.getRangeTo(source) < 3) {
                    return false;
                }
            }
            return true;
        });
        //filter out containers near minerals
        const minerals = this.creep.room.find(FIND_MINERALS);
        containers = containers.filter((container) => {
            for (let mineral of minerals) {
                if (container.pos.getRangeTo(mineral) < 3) {
                    return false;
                }
            }
            return true;
        });
        //filter out containers that are full
        containers = containers.filter((container) => container.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
        if (containers.length > 0) {
            const closestContainer = this.creep.pos.findClosestByPath(containers);
            if (this.creep.transfer(closestContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(closestContainer);
                return true; // Exit early if we're moving to a container or storage
            }
            return true;
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
            return true;
        } else {
            return false;
        }
    }
    resupplyLinks() {
        const links = this.creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_LINK && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
        });
        // get links saved in room.memory.links.senders
        if (this.creep.room.memory.links === undefined) {
            return false;
        }
        const senderLinkIDs = this.creep.room.memory.links.senders;
        let senderLinks = links.filter((link) => senderLinkIDs.includes(link.id));
        // filter out links that are full
        senderLinks = senderLinks.filter((link) => link.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
        if (senderLinks.length > 0) {
            const closestLink = this.creep.pos.findClosestByPath(senderLinks);
            if (this.creep.transfer(closestLink, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(closestLink);
                return true; // Exit early if we're moving to a container or storage
            }
            return true;
        } else {
            return false;
        }
    }
    upgradeRC() {
        const upgradeResult = this.creep.upgradeController(this.creep.room.controller);
        if (upgradeResult == ERR_NOT_IN_RANGE) {
            // Move to it
            this.moveTo(this.creep.room.controller);
            return true;
        } else if (upgradeResult == OK) {
            // check if link is within range 6
            const links = this.creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_LINK && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0,
            });
            if (links.length > 0) {
                const closestLink = this.creep.pos.findClosestByPath(links);
                if (this.creep.pos.getRangeTo(closestLink) < 6) {
                    // move beside it
                    this.moveTo(closestLink, {
                        reusePath: 1,
                    });
                }
                return true;
            }
        } else {
            return false;
        }
    }
    collectGround(source) {
        let droppedEnergy = this.creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: (resource) => resource.resourceType == RESOURCE_ENERGY,
        });
        if (source) {
            droppedEnergy = droppedEnergy.filter((resource) => resource.pos.findInRange(FIND_SOURCES, 8, { filter: { id: source } }).length > 0);
        }
        if (droppedEnergy.length > 0) {
            let target;
            if (!source) {
                const spawn = this.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
                if (spawn) {
                    droppedEnergy = droppedEnergy.filter((resource) => spawn.pos.getRangeTo(resource) < 3);
                }
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
        let containers = this.creep.room.find(FIND_STRUCTURES, {
            filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && s.store[RESOURCE_ENERGY] > 0,
        });
        // filter out containers within range 3 of sources
        const sources = this.creep.room.find(FIND_SOURCES);
        containers = containers.filter((container) => {
            for (let source of sources) {
                if (container.pos.getRangeTo(source) < 3) {
                    return false;
                }
            }
            return true;
        });
        // if a distributor, filter our containers more than range 10 of the spawn
        if (this.creep.memory.assignment === "distribution") {
            const spawn = this.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
            if (spawn) {
                containers = containers.filter((container) => spawn.pos.getRangeTo(container) < 10);
            }
        }
        if (containers.length > 0) {
            const closestContainer = this.creep.pos.findClosestByPath(containers);
            if (this.creep.withdraw(closestContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.moveTo(closestContainer);
                return true; // Exit early if we're moving to a container or storage
            }
            return true;
        }
        return false;
    }
    collectLink() {
        const links = Game.rooms[this.creep.memory.company].find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_LINK && structure.store[RESOURCE_ENERGY] > 0,
        });
        if (links.length > 0) {
            // console.log(`${this.creep.name} found ${links.length} links`);
            const closestLink = this.creep.pos.findClosestByPath(links);
            // if link is further than 8 tiles away, then don't collect from it
            if (this.creep.pos.getRangeTo(closestLink) > 5 && this.creep.memory.assignment !== "upgrade") {
                return false;
            }
            if (this.creep.withdraw(closestLink, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.moveTo(closestLink);
                return true; // Exit early if we're moving to a container or storage
            }
            return true;
        }
        return false;
    }
    collectSourceContainer() {
        const containers = this.creep.room.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0,
        });
        // get source from creep.memory.source
        const source = Game.getObjectById(this.creep.memory.source);
        // get containers near source
        const containersNearSource = containers.filter((container) => container.pos.getRangeTo(source) < 2);
        if (containersNearSource.length > 0) {
            const closestContainer = this.creep.pos.findClosestByPath(containersNearSource);
            if (this.creep.withdraw(closestContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.moveTo(closestContainer, {
                    reusePath: 5,
                });
                return true; // Exit early if we're moving to a container or storage
            }
            return true;
        }
        return false;
    }
    collectStorage() {
        const storage = Game.rooms[this.creep.memory.company].find(FIND_STRUCTURES, {
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
    collectSource() {
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
                    //   ignoreCreeps: true,
                    reusePath: 1,
                });
            }
        }
    }
}

export default Soldier;
