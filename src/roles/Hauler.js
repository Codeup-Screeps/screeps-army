import Soldier from "./Soldier";

class Hauler extends Soldier {
    constructor(creep) {
        super(creep.name);
        this.creep = creep;
    }
    run() {
        // if about to die, drop all energy
        if (this.creep.ticksToLive < 5) {
            this.creep.drop(RESOURCE_ENERGY);
            return;
        }
        this.manageModes();
        if (this.creep.memory.hauling) {
            this.haul();
        } else {
            this.collect();
        }
    }
    manageModes() {
        if (this.creep.memory.hauling === undefined) {
            this.creep.memory.hauling = true;
        }
        if (this.creep.memory.hauling && this.creep.store[RESOURCE_ENERGY] === 0) {
            this.creep.memory.refillLinks = this.checkLinks();
            if (this.creep.memory.refillLinks) {
                this.creep.say("🔄 refill");
            } else {
                this.creep.memory.hauling = false;
                this.creep.say("🔄 collect");
            }
        }
        if (!this.creep.memory.hauling && this.creep.store.getFreeCapacity() === 0) {
            this.creep.memory.hauling = true;
            this.creep.say("📦 haul");
        }
    }
    haul() {
        const distributerActive =
            this.creep.room.find(FIND_MY_CREEPS, {
                filter: (creep) => creep.memory.assignment == "distribution",
            }).length > 0
                ? true
                : false;
        if (this.creep.memory.refillLinks) {
            if (this.creep.store.getFreeCapacity() > 0) {
                if (this.collectContainer()) {
                    return;
                }
                if (this.collectStorage()) {
                    return;
                }
            } else {
                if (this.resupplyLinks()) {
                    return;
                } else {
                    this.creep.memory.refillLinks = false;
                }
            }
        }

        if (!distributerActive || this.creep.memory.assignment === "distribution") {
            if (this.resupplySpawn()) {
                return;
            }
            if (this.resupplyExtensions()) {
                return;
            }
            if (this.resupplyTowers()) {
                return;
            }
            if (this.resupplyLinks()) {
                return;
            }
            if (this.creep.memory.assignment === "distribution") {
                if (this.resupplyContainer()) {
                    return;
                }
                if (this.resupplyStorage()) {
                    return;
                }
                return;
            }
        }
        if (this.resupplyStorage()) {
            return;
        }
        if (this.resupplyContainer()) {
            return;
        }
        const spawn = this.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
        if (this.creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(spawn);
        } else {
            this.creep.drop(RESOURCE_ENERGY);
        }
    }
    collect() {
        const distributerActive =
            this.creep.room.find(FIND_MY_CREEPS, {
                filter: (creep) => creep.memory.assignment == "distribution",
            }).length > 0
                ? true
                : false;
        if (this.creep.memory.assignment === "distribution") {
            if (this.collectGround()) {
                return;
            }
            if (this.collectStorage()) {
                return;
            }
            if (this.collectContainer()) {
                return;
            }
            return;
        }
        if (this.creep.memory.refillSpawn === true && (!distributerActive || this.creep.memory.assignment === "distribution")) {
            if (this.collectContainer()) {
                return;
            }
            if (this.collectStorage()) {
                return;
            }
        }
        if (this.collectSourceContainer()) {
            return;
        }
        if (this.collectGround(this.creep.memory.source)) {
            return;
        }
    }
    checkLinks() {
        const distributerActive =
            this.creep.room.find(FIND_MY_CREEPS, {
                filter: (creep) => creep.memory.assignment == "distribution",
            }).length > 0
                ? true
                : false;
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
        // check storage or containers within range 10 of spawn
        const spawn = this.creep.pos.findClosestByRange(FIND_MY_SPAWNS);
        const energyContainers = spawn.pos.findInRange(FIND_STRUCTURES, 8, {
            filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && s.store.getUsedCapacity(RESOURCE_ENERGY) > 0,
        });
        if (senderLinks.length > 0 && energyContainers.length > 0) {
            if (distributerActive && this.creep.memory.assignment !== "distribution") {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
}

export default Hauler;
