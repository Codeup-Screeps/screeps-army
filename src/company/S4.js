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
        this.base = this.room.memory.base;
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

        // build the base
        if (this.startSpawn && this.room.memory.base) {
            const blueprint = new Blueprint(this.base, this.startSpawn.pos, this.room).build();
            if (Game.time % 500 === 0) {
                blueprint.buildRoadsToSources().buildRoadsToController();
                if (this.rcl >= 6) {
                    blueprint.buildRoadsToMinerals();
                    // add extractor to minerals
                    const minerals = this.room.find(FIND_MINERALS);
                    for (let mineral of minerals) {
                        mineral.pos.createConstructionSite(STRUCTURE_EXTRACTOR);
                    }
                }
            }
        } else {
            if (!this.room.memory.base) {
                this.determineBase();
            } else if (!this.startSpawn) {
                // this.placeSpawn();
            }
        }
        // keep container beside room controller
        // this.roomControllerContainer();
        // manage spawn energy
    }
    report(type) {
        switch (type) {
            case "minerals":
                // return all minerals in storage
                const storage = this.room.storage;
                const minerals = storage.store.filter((resource) => resource !== RESOURCE_ENERGY);
                return minerals;
                break;
        }
    }
    manageEngineers() {
        let unassignedEngineers = this.company.s1.personnel.engineers.filter((engineer) => engineer.creep.memory.assignment === undefined);
        let assignedEngineers = {
            builders: this.company.s1.personnel.engineers.filter((engineer) => engineer.creep.memory.assignment === "build"),
            upgraders: this.company.s1.personnel.engineers.filter((engineer) => engineer.creep.memory.assignment === "upgrade"),
            repairers: this.company.s1.personnel.engineers.filter((engineer) => engineer.creep.memory.assignment === "repair"),
            miners: this.company.s1.personnel.engineers.filter((engineer) => engineer.creep.memory.assignment === "mine"),
        };
        if (unassignedEngineers.length === 0) {
            return;
        }
        switch (this.rcl) {
            case 1:
                if (assignedEngineers.upgraders.length < 1) {
                    unassignedEngineers[0].creep.memory.assignment = "upgrade";
                    return;
                }
                if (assignedEngineers.builders.length < 1) {
                    unassignedEngineers[0].creep.memory.assignment = "build";
                    return;
                }
                if (assignedEngineers.repairers.length < 1) {
                    unassignedEngineers[0].creep.memory.assignment = "repair";
                    return;
                }
                break;
            case 2:
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
                break;
            case 6:
            case 7:
            case 8:
                if (assignedEngineers.upgraders.length < 1) {
                    unassignedEngineers[0].creep.memory.assignment = "upgrade";
                    return;
                }
                if (assignedEngineers.builders.length < 1) {
                    unassignedEngineers[0].creep.memory.assignment = "build";
                    return;
                }
                break;
            default:
                if (assignedEngineers.builders.length < 1) {
                    unassignedEngineers[0].creep.memory.assignment = "build";
                    return;
                }
                if (assignedEngineers.upgraders.length < 1) {
                    unassignedEngineers[0].creep.memory.assignment = "upgrade";
                    return;
                }
                break;
        }
    }
    manageHaulers() {
        // assign a designated source to each hauler in memory
        // if the hauler already has a source, leave it alone
        // otherwise, assign it to the source with the fewest haulers
        const haulers = this.company.s1.personnel.haulers;
        const distributer = haulers.filter((hauler) => hauler.creep.memory.assignment === "distribution");
        if (haulers.length > this.sources.length && distributer.length === 0) {
            for (let hauler of haulers) {
                if (!hauler.creep.memory.source) {
                    hauler.creep.memory.assignment = "distribution";
                }
            }
        }
        haulers.forEach((hauler) => {
            if (hauler.creep.memory.source || hauler.creep.memory.assignment === "distribution") {
                return;
            }
            // get sources
            const sources = this.room.find(FIND_SOURCES);
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
            for (let link of receiverLinks) {
                if (!this.room.memory.links.receivers.includes(link.id)) {
                    this.room.memory.links.receivers.push(link.id);
                }
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
        const senderLinks = this.room.memory.links.senders.map((id) => Game.getObjectById(id)).filter((link) => link);
        let receiverLinks = this.room.memory.links.receivers.map((id) => Game.getObjectById(id)).filter((link) => link);
        if (senderLinks.length === 0 || receiverLinks.length === 0) {
            return;
        }
        // if all receiverLinks are full, return
        let allFull = true;
        for (let receiverLink of receiverLinks) {
            if (!receiverLink) {
                continue;
            }
            if (receiverLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                allFull = false;
            }
        }
        if (allFull) {
            return;
        }
        // sort receiverLinks by amount of energy, where the first link is the emptiest
        receiverLinks = receiverLinks.sort((a, b) => a.store.getFreeCapacity(RESOURCE_ENERGY) - b.store.getFreeCapacity(RESOURCE_ENERGY));
        for (let senderLink of senderLinks) {
            if (!senderLink) {
                continue;
            }
            if (senderLink.store[RESOURCE_ENERGY] === 0) {
                continue;
            }
            for (let receiverLink of receiverLinks) {
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
        // get position of a flag named "Claim"
        const claimFlag = Game.flags["Claim"];
        if (!claimFlag) {
            return;
        }
        this.room.createConstructionSite(claimFlag.pos.x, claimFlag.pos.y, STRUCTURE_SPAWN);
    }
}

export default CompanyS4;
