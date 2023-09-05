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
        this.sources = this.room.find(FIND_SOURCES);
        this.links = this.room.find(FIND_MY_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_LINK });
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
        this.sourceContainers();
        this.manageSpawnEnergy();
        if (this.assignLinks()) {
            this.transferLinks();
        }

        if (!this.room.memory.bunker) {
            this.room.memory.bunker = {};
        }
        // build the base
        if (this.startSpawn) {
            const blueprint = new Blueprint(this.base, this.startSpawn.pos, this.room).build();
            if (Game.time % 500 === 0) {
                blueprint.buildRoadsToSources().buildRoadsToController();
            }
        } else {
            if (!this.room.memory.base) {
                this.determineBase();
            } else {
                this.placeSpawn();
            }
        }
        // keep container beside room controller
        // this.roomControllerContainer();
        // manage spawn energy
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
        if (assignedEngineers.repairers.length < 1) {
            unassignedEngineers[0].creep.memory.assignment = "repair";
            return;
        }
        if (assignedEngineers.upgraders.length < 1) {
            unassignedEngineers[0].creep.memory.assignment = "upgrade";
            return;
        }
        if (assignedEngineers.builders.length < 1) {
            unassignedEngineers[0].creep.memory.assignment = "build";
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
    assignLinks() {
        if (this.links.length === 0) {
            return false;
        }
        const senderLinks = this.links.filter((link) => link.pos.getRangeTo(this.startSpawn) < 5);
        // save id of link in room.memory.links.senders
        if (this.room.memory.links === undefined) {
            this.room.memory.links = {};
            return false;
        }
        if (this.room.memory.links.senders === undefined) {
            this.room.memory.links.senders = [];
            return false;
        }
        if (senderLinks.length > 0) {
            if (!this.room.memory.links.senders.includes(senderLinks[0].id)) {
                this.room.memory.links.senders.push(senderLinks[0].id);
            }
        } else {
            return false;
        }
        const receiverLinks = this.links.filter((link) => link.pos.getRangeTo(this.room.controller) < 5);
        // save id of link in room.memory.links.receivers
        if (this.room.memory.links.receivers === undefined) {
            this.room.memory.links.receivers = [];
            return false;
        }
        if (receiverLinks.length > 0) {
            if (!this.room.memory.links.receivers.includes(receiverLinks[0].id)) {
                this.room.memory.links.receivers.push(receiverLinks[0].id);
            }
        } else {
            return false;
        }
        return true;
    }
    transferLinks() {
        if (this.room.memory.links === undefined) {
            return;
        }
        if (this.room.memory.links.senders === undefined) {
            return;
        }
        if (this.room.memory.links.receivers === undefined) {
            return;
        }
        const senderLinks = this.room.memory.links.senders.map((id) => Game.getObjectById(id));
        const receiverLinks = this.room.memory.links.receivers.map((id) => Game.getObjectById(id));
        // if all receiverLinks are full, return
        let allFull = true;
        for (let receiverLink of receiverLinks) {
            if (receiverLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                allFull = false;
            }
        }
        if (allFull) {
            return;
        }
        for (let senderLink of senderLinks) {
            if (senderLink.store[RESOURCE_ENERGY] === 0) {
                continue;
            }
            for (let receiverLink of receiverLinks) {
                if (receiverLink.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                    continue;
                }
                senderLink.transferEnergy(receiverLink);
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
    sourceContainers() {
        // find sources without containers and build them
        const sources = this.room.find(FIND_SOURCES);
        for (let source of sources) {
            // if there's already a container within 3 spaces of the source, don't build another one
            if (source.pos.findInRange(FIND_STRUCTURES, 3, { filter: (s) => s.structureType == STRUCTURE_CONTAINER }).length > 0) {
                continue;
            }
            // find sapper within 3 spaces of source
            const sappers = source.pos.findInRange(FIND_MY_CREEPS, 1, { filter: (c) => c.memory.role == "sapper" });
            if (sappers.length === 0) {
                continue;
            }
            // get current position of sappers[0]
            const sapperPos = sappers[0].pos;
            // place a container construction site on top of the sapper pos
            this.room.createConstructionSite(sapperPos.x, sapperPos.y, STRUCTURE_CONTAINER);
        }
    }
    determineBase() {
        if (this.sources.length == 1) {
            this.room.memory.base = "SmallFOB";
        } else if (this.sources.length == 2) {
            this.room.memory.base = "Bunker";
        }
    }
    placeSpawn() {
        const baseDimensions = new Blueprint(this.room.memory.base, { x: 25, y: 25 }, this.room).getDimensions();
        // get terrain of the room
        const terrain = Game.map.getRoomTerrain(this.room.name);
        // find open space within base dimensions
        let openPositions = [];
        for (let x = 25 - baseDimensions.width / 2; x < 25 + baseDimensions.width / 2; x++) {
            for (let y = 25 - baseDimensions.height / 2; y < 25 + baseDimensions.height / 2; y++) {
                if (terrain.get(x, y) != TERRAIN_MASK_WALL) {
                    openPositions.push(new RoomPosition(x, y, this.room.name));
                }
            }
        }
        // find open space closest to closest source
        let closestPosition = openPositions[0];
        let closestDistance = 50;
        for (let position of openPositions) {
            const distance = position.getRangeTo(this.sources[0]);
            if (distance < closestDistance) {
                closestPosition = position;
                closestDistance = distance;
            }
        }
        // place spawn
        this.room.createConstructionSite(closestPosition, STRUCTURE_SPAWN);
    }
}

export default CompanyS4;
