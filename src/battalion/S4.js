class BattalionS4 {
    /* (Logistics): Manages supply chains and maintenance.
     * Handle resource flow, storage, and building/repair operations.
     */
    constructor(battalion) {
        this.battalion = battalion;
    }
    run() {
        // Do S4 stuff
        this.sendBuilders();
    }
    report(type) {
        switch (type) {
            case "minerals":
                // return all minerals in storage
                // console.log(`${JSON.stringify(this.battalion.rooms)}`);
                const allMinerals = this.battalion.rooms.reduce(
                    (accumulator, room) => {
                        const storage = room.find(FIND_MY_STRUCTURES, {
                            filter: (structure) => structure.structureType === STRUCTURE_STORAGE,
                        })[0] || { store: {} };
                        const minerals = {
                            H: storage.store[RESOURCE_HYDROGEN] || 0,
                            O: storage.store[RESOURCE_OXYGEN] || 0,
                            U: storage.store[RESOURCE_UTRIUM] || 0,
                            K: storage.store[RESOURCE_KEANIUM] || 0,
                            L: storage.store[RESOURCE_LEMERGIUM] || 0,
                            Z: storage.store[RESOURCE_ZYNTHIUM] || 0,
                            X: storage.store[RESOURCE_CATALYST] || 0,
                        };
                        for (const mineral in minerals) {
                            accumulator[mineral] += minerals[mineral];
                        }
                        return accumulator;
                    },
                    {
                        H: 0,
                        O: 0,
                        U: 0,
                        K: 0,
                        L: 0,
                        Z: 0,
                        X: 0,
                    }
                );
                // only include minerals that are above 0
                Object.keys(allMinerals).forEach((mineral) => {
                    if (allMinerals[mineral] === 0) {
                        delete allMinerals[mineral];
                    }
                });
                return allMinerals;
                break;
        }
    }
    sendBuilders() {
        // if there is a room with a spawn construction site
        const spawnConstructionSites = Object.values(Game.constructionSites).filter((site) => site.structureType === STRUCTURE_SPAWN);
        // console.log(JSON.stringify(spawnConstructionSites));
        if (spawnConstructionSites.length > 0) {
            // check if room has a builder
            // console.log("Construction sites => ", JSON.stringify(spawnConstructionSites[0]));
            const builders = Object.values(Game.creeps).filter(
                (creep) => creep.memory.role === "engineer" && creep.memory.specialJob === spawnConstructionSites[0].id
            );
            // console.log(`Found ${builders.length} special builders`);
            if (builders.length === 0) {
                // console.log(`${spawnConstructionSites[0].room.name} needs a builder.`);
                // if not, get all the bunkers
                // Memory.rooms is an object
                let bunkerRooms = [];
                for (const room in Memory.rooms) {
                    if (Memory.rooms[room].name === spawnConstructionSites[0].pos.roomName) {
                        continue;
                    }
                    if (Memory.rooms[room].base === "Bunker") {
                        bunkerRooms.push(room);
                    }
                }
                if (bunkerRooms.length === 0) {
                    if (Game.time % 50 === 0) {
                        console.log(`No bunker rooms found.`);
                    }
                    return;
                }
                // console.log(`Bunker rooms:`);
                // console.log(JSON.stringify(bunkerRooms));
                const closestBunkerRoom = bunkerRooms.reduce(
                    (accumulator, room) => {
                        console.log("Room => ", JSON.stringify(room));
                        if (room === spawnConstructionSites[0].pos.roomName) {
                            return accumulator;
                        }
                        const distance = Game.map.getRoomLinearDistance(room, spawnConstructionSites[0].pos.roomName);
                        if (distance < accumulator.distance) {
                            accumulator = {
                                room,
                                distance,
                            };
                        }
                        return accumulator;
                    },
                    { room: null, distance: 100 }
                );
                if (closestBunkerRoom.room === null) {
                    console.log(`No closest bunker room found.`);
                    return;
                }
                console.log(`Closest bunker room is ${closestBunkerRoom.room}.`);
                const availableSpawns = Game.rooms[closestBunkerRoom.room].find(FIND_MY_STRUCTURES, {
                    filter: (structure) => structure.structureType === STRUCTURE_SPAWN,
                });
                if (availableSpawns.length === 0) {
                    if (Game.time % 50 === 0) {
                        console.log(`No available spawns found.`);
                    }
                    return;
                }
                if (availableSpawns[0].room.energyAvailable < 300) {
                    return;
                }
                // console.log(`Recruiting a new Builder in ${availableSpawns[0]} to build a spawn in ${spawnConstructionSites[0].room.name}`);
                // Recruit a new Engineer
                this.battalion.companies
                    .find((company) => company.name === availableSpawns[0].room.name)
                    .s1.recruit("engineer", spawnConstructionSites[0].id);
            }
        }
    }
}

export default BattalionS4;
