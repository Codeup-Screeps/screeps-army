import Soldier from "./Soldier";

class Miner extends Soldier {
    constructor(creep) {
        super(creep);
        this.creep = creep;
    }
    run() {
        // if about to die, drop all minerals
        if (this.creep.ticksToLive < 5) {
            this.creep.drop(Object.keys(this.creep.store)[0]);
            return;
        }

        this.manageModes();
        if (this.creep.memory.mode === "mine") {
            this.mine();
        }
        if (this.creep.memory.mode === "deposit") {
            this.deposit();
        }
    }
    manageModes() {
        if (this.creep.memory.mode === undefined) {
            this.creep.memory.mode = "mine";
            this.creep.say("⛏️ Mine");
        }
        if (this.creep.memory.mode === "mine" && this.creep.store.getFreeCapacity() === 0) {
            this.creep.memory.mode = "deposit";
            this.creep.say("🚚 Deposit");
        }
        if (this.creep.memory.mode === "deposit" && this.creep.store.getUsedCapacity() === 0) {
            this.creep.memory.mode = "mine";
            this.creep.say("⛏️ Mine");
        }
    }
    mine() {
        const extractors = this.creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_EXTRACTOR,
        });
        if (extractors.length === 0) {
            return;
        }
        const extractor = extractors[0];
        const minerals = this.creep.room.find(FIND_MINERALS);
        if (minerals.length === 0) {
            return;
        }
        const mineral = minerals[0];
        let droppedMinerals = this.creep.room.find(FIND_DROPPED_RESOURCES);
        droppedMinerals = droppedMinerals.filter((mineral) => mineral.resourceType === mineral.mineralType);
        if (droppedMinerals.length > 0) {
            if (this.creep.pickup(droppedMinerals[0]) == ERR_NOT_IN_RANGE) {
                this.creep.moveTo(droppedMinerals[0]);
            }
            return;
        }
        if (this.creep.harvest(mineral) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(mineral);
        }
        return;
    }
    deposit() {
        const storage = this.creep.room.storage;
        if (storage === undefined) {
            return;
        }
        // get the mineral being carried
        const mineral = Object.keys(this.creep.store)[0];
        if (this.creep.transfer(storage, mineral) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(storage);
        }
    }
}

export default Miner;
