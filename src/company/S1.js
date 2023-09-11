class CompanyS1 {
    /* (Personnel) Manages human resources
     *  Handle creep spawning, renewing, and role assignment.
     */
    constructor(company) {
        this.company = company;
        this.name = "S1";
        this.rcl = this.company.room.controller.level;
        this.sources = this.company.sources;
        this.personnel = {
            engineers: this.company.soldiers.filter((soldier) => soldier.creep.memory.role === "engineer"),
            haulers: this.company.soldiers.filter((soldier) => soldier.creep.memory.role === "hauler"),
            infantrymen: this.company.soldiers.filter((soldier) => soldier.creep.memory.role === "infantryman"),
            medics: this.company.soldiers.filter((soldier) => soldier.creep.memory.role === "medic"),
            riflemen: this.company.soldiers.filter((soldier) => soldier.creep.memory.role === "rifleman"),
            sappers: this.company.soldiers.filter((soldier) => soldier.creep.memory.role === "sapper"),
            scouts: this.company.soldiers.filter((soldier) => soldier.creep.memory.role === "scout"),
            miners: this.company.soldiers.filter((soldier) => soldier.creep.memory.role === "miner"),
        };
        if (this.rcl < 3) {
            this.requiredPersonnel = {
                engineer: 1 + this.sources.length,
                hauler: this.sources.length,
                sapper: this.sources.length,
            };
        } else {
            this.requiredPersonnel = {
                engineer: 2,
                hauler: this.sources.length + 1,
                sapper: this.sources.length,
            };
        }
        this.energyAvailable = this.company.room.energyAvailable;
        this.minLoadout = 300 + (50 * this.company.extensions.length) / 2;
        this.maxLoadout = 300 + (50 * this.company.extensions.length) / 1.5;
        if (this.minLoadout > 1000 || this.maxLoadout > 1000) {
            this.minLoadout = 1000;
            this.maxLoadout = 1000;
        }
        if (this.personnel.engineers.length === 0 && this.personnel.haulers.length === 0) {
            this.minLoadout = 300;
            this.maxLoadout = 300;
        }
    }
    run() {
        // Do S1 stuff
        this.roleCall();
        this.announceNewRecruits();
    }
    roleCall() {
        // console.log(`S1(${this.company.name}) Role Call: ${this.personnel.engineers.length} Engineers, ${this.personnel.haulers.length} Haulers, ${this.personnel.sappers.length} Sappers`);
        // Check if we need to recruit more Soldiers
        if (this.personnel.sappers.length === 1 && this.personnel.haulers.length === 0) {
            this.recruit("hauler");
            return;
        }
        if (this.personnel.sappers.length < this.requiredPersonnel.sapper) {
            this.recruit("sapper");
            return;
        }
        if (this.personnel.haulers.length < this.requiredPersonnel.hauler) {
            this.recruit("hauler");
            return;
        }
        // get constructions sites
        const constructionSites = this.company.room.find(FIND_CONSTRUCTION_SITES);
        if (this.rcl >= 5 && constructionSites.length > 0) {
            if (this.personnel.engineers.length < this.requiredPersonnel.engineer) {
                this.recruit("engineer");
                return;
            }
        } else if (this.rcl < 5) {
            if (this.personnel.engineers.length < this.requiredPersonnel.engineer) {
                this.recruit("engineer");
                return;
            }
        } else {
            if (this.personnel.engineers.length < 1) {
                this.recruit("engineer");
                return;
            }
        }
        if (this.rcl > 5 && this.personnel.miners < 1) {
            // get mineral deposits
            const minerals = this.company.room.find(FIND_MINERALS);
            let hasMinerals = false;
            for (let mineral of minerals) {
                if (mineral.mineralAmount > 0) {
                    hasMinerals = true;
                }
            }
            if (hasMinerals) {
                this.recruit("miner");
            }
            return;
        }
    }
    recruit(role, specialJob = null) {
        // Check if we have enough energy to spawn a new Soldier
        if (this.minLoadout > this.company.room.energyAvailable) {
            return;
        }
        const availableSpawns = this.company.spawns.filter((spawn) => !spawn.spawning);
        if (availableSpawns.length === 0) {
            return;
        }
        // Recruit a new Soldier
        const newName = role + Game.time;
        const loadout = this.getLoadout(role);
        if (specialJob) {
            availableSpawns[0].spawnCreep(loadout, newName, {
                memory: { role: role, specialJob: specialJob, company: "hhc", assignment: "build" },
            });
            return;
        } else {
            availableSpawns[0].spawnCreep(loadout, newName, {
                memory: { role: role, company: this.company.name },
            });
        }
    }
    getLoadout(role) {
        let availableEnergy = this.company.room.energyAvailable;
        if (role === "sapper" && availableEnergy > 750) {
            this.maxLoadout = 750;
        }
        if (availableEnergy > this.maxLoadout) {
            availableEnergy = this.maxLoadout;
        }
        const parts = {
            MOVE: 50,
            WORK: 100,
            CARRY: 50,
            ATTACK: 80,
            RANGED_ATTACK: 150,
            HEAL: 250,
            CLAIM: 600,
            TOUGH: 10,
        };
        const loadout = [];
        switch (role) {
            case "engineer":
                loadout.push(WORK, CARRY, MOVE);
                availableEnergy -= parts["WORK"] + parts["CARRY"] + parts["MOVE"];
                while (availableEnergy >= parts["WORK"] + parts["CARRY"] + parts["MOVE"]) {
                    loadout.unshift(WORK);
                    loadout.push(CARRY);
                    loadout.push(MOVE);
                    availableEnergy -= parts["WORK"] + parts["CARRY"] + parts["MOVE"];
                }
                break;
            case "hauler":
                loadout.push(CARRY, CARRY, MOVE, MOVE);
                availableEnergy -= parts["CARRY"] + parts["CARRY"] + parts["MOVE"] + parts["MOVE"];
                while (availableEnergy >= parts["CARRY"] + parts["MOVE"]) {
                    loadout.unshift(CARRY);
                    loadout.push(MOVE);
                    availableEnergy -= parts["CARRY"] + parts["MOVE"];
                }
                break;
            case "infantryman":
                break;
            case "medic":
                break;
            case "rifleman":
                break;
            case "sapper":
                loadout.push(MOVE);
                loadout.push(CARRY);
                availableEnergy -= parts["MOVE"];
                availableEnergy -= parts["CARRY"];
                // harvesters mostly work, but need to replace dead ones quicker
                for (let i = 1; availableEnergy >= parts["WORK"]; i++) {
                    if (i % 4 === 0) {
                        loadout.unshift(MOVE);
                        availableEnergy -= parts["MOVE"];
                    } else {
                        loadout.push(WORK);
                        availableEnergy -= parts["WORK"];
                    }
                }
                break;
            case "scout":
                break;
            case "miner":
                loadout.push(WORK, CARRY, MOVE);
                availableEnergy -= parts["WORK"] + parts["CARRY"] + parts["MOVE"];
                while (availableEnergy >= parts["WORK"] + parts["CARRY"] + parts["MOVE"]) {
                    loadout.unshift(WORK);
                    loadout.push(CARRY);
                    loadout.push(MOVE);
                    availableEnergy -= parts["WORK"] + parts["CARRY"] + parts["MOVE"];
                }
                break;
            default:
                break;
        }
        return loadout;
    }
    announceNewRecruits() {
        for (let spawn of this.company.spawns) {
            if (spawn.spawning) {
                // Get the creep being spawned
                let newRecruit = Game.creeps[spawn.spawning.name];
                // Visualize the role of the spawning creep above the spawn
                spawn.room.visual.text("🛠️" + newRecruit.memory.role, spawn.pos.x + 1, spawn.pos.y, { align: "left", opacity: 0.8 });
            }
        }
    }
}

export default CompanyS1;
