class CompanyS2 {
    /* (Intelligence) Gathers and analyzes intelligence
     *  Manage scouting operations, monitoring other players, and keeping track of hostile movements.
     */
    constructor(company) {
        this.company = company;
        this.room = this.company.room;
    }
    run() {
        // Do S2 stuff
        // this.report();
    }
    getEnergyHarvestingRate() {
        let sources = this.room.find(FIND_SOURCES);
        let totalEnergyMined = sources.reduce((sum, source) => sum + (source.energyCapacity - source.energy), 0);
        return totalEnergyMined / sources.length;
    }

    getEnergyStorageUtilization() {
        let storages = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_STORAGE,
        });
        let totalEnergyInStorages = storages.reduce((sum, storage) => sum + storage.store[RESOURCE_ENERGY], 0);
        let totalStorageCapacity = storages.reduce((sum, storage) => sum + storage.store.getCapacity(RESOURCE_ENERGY), 0);
        if (totalStorageCapacity === 0) return 0; // Handle no storage or empty storage
        return totalEnergyInStorages / totalStorageCapacity;
    }

    getSpawnConsumptionRate() {
        let spawns = this.room.find(FIND_MY_SPAWNS);
        let totalEnergyUsed = spawns.reduce((sum, spawn) => sum + spawn.energyUsed, 0);
        let totalEnergyCapacity = spawns.reduce((sum, spawn) => sum + spawn.energyCapacity, 0);
        if (totalEnergyCapacity === 0 || totalEnergyUsed === 0) return 0; // Handle no spawns
        return totalEnergyUsed / totalEnergyCapacity;
    }

    getEnergyTransportationEfficiency() {
        let creeps = this.room.find(FIND_MY_CREEPS);
        let totalEnergyHarvested = creeps.reduce((sum, creep) => sum + (creep.memory.totalEnergyHarvested || 0), 0);
        let totalEnergyDelivered = creeps.reduce((sum, creep) => sum + (creep.memory.totalEnergyDelivered || 0), 0);
        if (totalEnergyHarvested === 0) return 0; // Handle no energy harvested
        return totalEnergyDelivered / totalEnergyHarvested;
    }

    getEnergyUpgradeEfficiency() {
        let controller = this.room.controller;
        let totalEnergyUsedForUpgrading = controller.progressTotal - controller.progress;
        return totalEnergyUsedForUpgrading / this.getEnergyHarvestingRate();
    }

    report() {
        console.log(`Room: ${this.room.name}`);
        console.log(`-------------------------------------`);
        console.log(`Energy Harvesting Rate: ${this.getEnergyHarvestingRate().toFixed(2)}`);
        console.log(`Energy Storage Utilization: ${this.getEnergyStorageUtilization().toFixed(2)}`);
        console.log(`Energy Consumption Rate: ${this.getSpawnConsumptionRate().toFixed(2)}`);
        console.log(`Energy Transportation Efficiency: ${this.getEnergyTransportationEfficiency().toFixed(2)}`);
        console.log(`Energy Upgrade Efficiency: ${this.getEnergyUpgradeEfficiency().toFixed(2)}`);
    }
}

export default CompanyS2;
