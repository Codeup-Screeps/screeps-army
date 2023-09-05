import Soldier from "./Soldier";

class Hauler extends Soldier {
    constructor(creep) {
        super(creep.name);
        this.creep = creep;
    }
    run() {
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
            this.creep.memory.hauling = false;
            this.creep.say("🔄 collect");
        }
        if (!this.creep.memory.hauling && this.creep.store.getFreeCapacity() === 0) {
            this.creep.memory.hauling = true;
            this.creep.say("📦 haul");
        }
    }
    haul() {
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
        if (this.resupplyContainer()) {
            return;
        }
        if (this.resupplyStorage()) {
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
        if (this.creep.memory.refillSpawn === true) {
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
}

export default Hauler;
