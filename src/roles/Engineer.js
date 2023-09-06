import Soldier from "./Soldier";

class Engineer extends Soldier {
    constructor(creep) {
        super(creep.name);
        this.creep = creep;
    }
    manageMode() {
        // mode switching
        if (this.creep.memory.mode === undefined) {
            this.creep.memory.mode = "collect";
        }
        if (this.creep.memory.mode === "work" && this.creep.store[RESOURCE_ENERGY] === 0) {
            this.creep.memory.mode = "collect";
            this.creep.say("🔄 collect");
        }
        if (this.creep.memory.mode === "collect" && this.creep.store.getFreeCapacity() === 0) {
            this.creep.memory.mode = "work";
            this.creep.say(`🚧 ${this.creep.memory.assignment}`);
        }
    }
    run() {
        this.manageMode();
        if (this.creep.memory.mode === "work") {
            this.work();
        }
        if (this.creep.memory.mode === "collect") {
            this.collect();
        }
    }
    work() {
        if (this.creep.memory.assignment === "build") {
            if (this.creep.memory.specialJob) {
                if (this.build(this.creep.memory.specialJob)) {
                    return;
                }
            }
            if (this.build()) {
                return;
            }
            // if no haulers
            const haulers = this.creep.room.find(FIND_MY_CREEPS, {
                filter: (creep) => creep.memory.role == "hauler",
            });
            if (haulers.length === 0) {
                if (this.resupplyExtensions()) {
                    return;
                }
                if (this.resupplyTowers()) {
                    return;
                }
            }
            this.upgradeRC();
        }
        if (this.creep.memory.assignment === "upgrade") {
            this.upgrade();
            return;
        }
        if (this.creep.memory.assignment === "repair") {
            if (this.repair()) {
                return;
            }
            // If no repair sites, help build
            if (this.build()) {
                return;
            }
        }
    }
    build(id = null) {
        if (id) {
            const target = Game.getObjectById(id);
            if (target) {
                const buildResult = this.creep.build(target);
                if (buildResult == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(target);
                    return true;
                }
                return;
            } else {
                if (this.resupplySpawn()) {
                    return;
                }
            }
            return;
        }
        // find construction sites
        let targets = this.creep.room.find(FIND_CONSTRUCTION_SITES);
        // remove ramparts that have over 50k hits
        targets = targets.filter((target) => target.structureType !== STRUCTURE_RAMPART || target.hits < 50000);
        // get extensions
        const extensions = targets.filter((target) => target.structureType == STRUCTURE_EXTENSION);
        // sort extensions by proximity to creep and progress remaining
        extensions.sort((a, b) => this.creep.pos.getRangeTo(a) - this.creep.pos.getRangeTo(b) + (a.progressTotal - a.progress) - (b.progressTotal - b.progress));
        if (extensions.length > 0) {
            if (this.creep.build(extensions[0]) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(extensions[0]);
            }
            return true;
        }
        // sort targets by combination of proximity to creep and progress remaining
        targets.sort((a, b) => {
            return this.creep.pos.getRangeTo(a) - this.creep.pos.getRangeTo(b) + (a.progressTotal - a.progress) - (b.progressTotal - b.progress);
        });
        if (targets.length > 0) {
            if (this.creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(targets[0]);
            }
            return true;
        } else {
            targets = this.creep.room.find(FIND_CONSTRUCTION_SITES).filter((target) => target.structureType == STRUCTURE_RAMPART || target.hits < 5000);
            if (targets.length > 0) {
                // sort by least hits
                targets.sort((a, b) => {
                    return a.hits - b.hits;
                });
                if (this.creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(targets[0]);
                }
                return true;
            }
            return false;
        }
    }
    collect() {
        if (this.creep.memory.specialJob) {
            if (this.collectContainer()) {
                return;
            }
            if (this.collectGround()) {
                return;
            }
            this.collectSource();
            return;
        }
        if (this.creep.memory.assignment === "upgrade") {
            if (this.creep.memory.settled) {
                // get links within range 1
                const links = this.creep.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: (s) => s.structureType == STRUCTURE_LINK,
                });
                // collect from links
                if (links.length > 0) {
                    for (let link of links) {
                        if (link.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                            this.creep.withdraw(link, RESOURCE_ENERGY);
                            return;
                        }
                    }
                }
                return;
            }
            if (this.collectLink()) {
                return;
            }
        }
        if (this.collectGround()) {
            return;
        }
        if (this.collectLink()) {
            return;
        }
        if (this.collectContainer()) {
            return;
        }
        // if there are no haulers
        const haulers = this.creep.room.find(FIND_MY_CREEPS, {
            filter: (creep) => creep.memory.role == "hauler",
        });
        const sources = this.creep.room.find(FIND_SOURCES);
        if (haulers.length === 0) {
            if (this.collectGround(sources[0].id)) {
                return;
            }
        }
    }
    repair() {
        // Repairing logic
        let structuresToRepair = this.creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL,
        });
        // filter out ramparts if they are below 50k hits
        structuresToRepair = structuresToRepair.filter((structure) => structure.structureType != STRUCTURE_RAMPART || structure.hits > 50000);
        structuresToRepair.sort((a, b) => a.hits - b.hits); // Repair the most damaged first

        if (structuresToRepair.length > 0) {
            // Non road structures
            const nonRoadStructuresToRepair = structuresToRepair.filter((structure) => structure.structureType != STRUCTURE_ROAD);
            // Non road structures with less than half hits
            const nonRoadStructuresToRepairLessThanHalf = nonRoadStructuresToRepair.filter((structure) => structure.hits < structure.hitsMax / 2);
            if (nonRoadStructuresToRepairLessThanHalf.length > 0) {
                structuresToRepair = nonRoadStructuresToRepairLessThanHalf;
            }

            if (this.creep.repair(structuresToRepair[0]) === ERR_NOT_IN_RANGE) {
                this.creep.moveTo(structuresToRepair[0]);
            }
            return true;
        } else {
            // No structures to repair, so consider other tasks or stay idle
            // e.g., creep.moveTo(Game.flags["IdleFlag"]);
            return false;
        }
    }
    upgrade() {
        this.upgradeRC();
        // if this creep is within range of the controller, and within collect range of a link, set it settled
        const controller = this.creep.room.controller;
        const link = this.creep.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: (s) => s.structureType == STRUCTURE_LINK,
        });
        if (controller && link.length > 0) {
            this.creep.memory.settled = true;
        }
    }
}

export default Engineer;
