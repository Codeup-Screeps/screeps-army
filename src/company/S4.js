import Blueprint from "../blueprints/Blueprint";

class CompanyS4 {
    /* (Logistics): Manages supply chains and maintenance.
     * Handle resource flow, storage, and building/repair operations.
     */
    constructor(company) {
        this.company = company;
        this.room = this.company.room;
        this.name = "S4";
        // startSpawn is the first spawn in the room
        this.startSpawn = this.room.find(FIND_MY_SPAWNS)[0];
        this.rcl = this.room.controller.level;
        this.gcl = Game.gcl.level;
        this.base = this.room.memory.base || "Bunker";
        this.energyPercentage = (this.room.energyAvailable / this.room.energyCapacityAvailable) * 100;
        this.constructionSites = this.room.find(FIND_MY_CONSTRUCTION_SITES);
    }
    run() {
        // Do S4 stuff
        this.manageEngineers();
        this.manageHaulers();

        if (!this.room.memory.bunker) {
            this.room.memory.bunker = {};
        }
        // build the base
        const blueprint = new Blueprint(this.base, this.startSpawn.pos, this.room).build();
        if (Game.time % 500 === 0) {
            blueprint.buildRoadsToSources().buildRoadsToController();
        }
        // keep container beside room controller
        this.roomControllerContainer();
        // manage spawn energy
        this.manageSpawnEnergy();
    }
    manageEngineers() {
        let unassignedEngineers = this.company.s1.personnel.engineers.filter((engineer) => engineer.creep.memory.assignment === undefined);
        let assignedEngineers = {
            builders: this.company.s1.personnel.engineers.filter((engineer) => engineer.creep.memory.assignment === "build"),
            upgraders: this.company.s1.personnel.engineers.filter((engineer) => engineer.creep.memory.assignment === "upgrade"),
            repairers: this.company.s1.personnel.engineers.filter((engineer) => engineer.creep.memory.assignment === "repair"),
        };
        if (unassignedEngineers.length === 0) {
            return;
        }
        if (assignedEngineers.builders.length < 2) {
            unassignedEngineers[0].creep.memory.assignment = "build";
            return;
        }
        if (assignedEngineers.upgraders.length < 1) {
            unassignedEngineers[0].creep.memory.assignment = "upgrade";
            return;
        }
        if (assignedEngineers.repairers.length < 1) {
            unassignedEngineers[0].creep.memory.assignment = "repair";
            return;
        }
    }
    manageHaulers() {
        // assign a designated source to each hauler in memory
        // if the hauler already has a source, leave it alone
        // otherwise, assign it to the source with the fewest haulers
        const haulers = this.company.s1.personnel.haulers;
        haulers.forEach((hauler) => {
            if (hauler.creep.memory.source) {
                return;
            }
            // get sources that have sappers around them
            const sources = this.room.find(FIND_SOURCES).filter((source) => {
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
                let sappers = 0;
                for (let pos of positions) {
                    const creepsAtPos = this.room.lookForAt(LOOK_CREEPS, pos[0], pos[1]);
                    for (let creepAtPos of creepsAtPos) {
                        if (creepAtPos.memory.role === "sapper") {
                            sappers++;
                        }
                    }
                }
                return sappers > 0;
            });
            if (sources.length === 0) {
                return;
            }
            // sort sources by number of haulers
            sources.sort((a, b) => {
                const haulersAtA = haulers.filter((hauler) => hauler.creep.memory.source === a.id).length;
                const haulersAtB = haulers.filter((hauler) => hauler.creep.memory.source === b.id).length;
                return haulersAtA - haulersAtB;
            });
            hauler.creep.memory.source = sources[0].id;
        });
    }
    manageSpawnEnergy() {
        if (this.room.energyAvailable < this.room.energyCapacityAvailable) {
            let assignedHauler = this.room.find(FIND_MY_CREEPS, {
                filter: (creep) => creep.memory.refillSpawn == true,
            });
            if (assignedHauler.length == 0) {
                // assign a hauler to refill spawn
                let haulers = this.room.find(FIND_MY_CREEPS, {
                    filter: (creep) => creep.memory.role == "hauler",
                });
                if (haulers.length > 0) {
                    haulers[0].memory.refillSpawn = true;
                }
            }
        } else {
            let assignedHauler = this.room.find(FIND_MY_CREEPS, {
                filter: (creep) => creep.memory.refillSpawn == true,
            });
            if (assignedHauler.length > 0) {
                assignedHauler[0].memory.refillSpawn = false;
            }
        }
    }
    roomControllerContainer() {
        // save cpu by only running this every 1000 ticks
        if (Game.time % 1000 === 0 && this.rcl >= 2) {
            // keep container beside room controller
            if (!this.room.controller) {
                return;
            }
            if (this.room.controller.pos.findInRange(FIND_STRUCTURES, 6, { filter: (s) => s.structureType == STRUCTURE_CONTAINER }).length > 0) {
                return;
            }
            // find open space beside controller. requirements: within 3 spaces of controller, not on a wall, not on a road
            const roadPos = this.room.controller.pos.findInRange(FIND_STRUCTURES, 4, {
                filter: (s) => s.structureType == STRUCTURE_ROAD,
            });
            // find an open plain or swamp tile beside roadPos
            const openPositions = this.room
                .lookForAtArea(LOOK_TERRAIN, roadPos[0].pos.y - 1, roadPos[0].pos.x - 1, roadPos[0].pos.y + 1, roadPos[0].pos.x + 1, true)
                .filter((t) => t.terrain != "wall" && t.terrain != "road");
            if (openPositions.length === 0) {
                return;
            }
            // create container
            this.room.createConstructionSite(openPositions[0].x, openPositions[0].y, STRUCTURE_CONTAINER);
        }
    }
}

export default CompanyS4;
