import Soldier from "./Soldier";

class Scout extends Soldier {
    constructor(creep) {
        super(creep.name);
        this.creep = creep;
    }
    run() {
        // Check if the scout is in a new room
        if (this.creep.room.name !== this.creep.memory.lastRoom) {
            delete this.creep.memory.targetExit; // Clear the target exit
            this.creep.memory.previousRoom = this.creep.memory.lastRoom; // Store the last room
            this.creep.memory.lastRoom = this.creep.room.name;
        }

        this.explore();
    }
    explore() {
        this.gatherIntel();
        if (this.clearFromExit()) {
            // at this point, closest exit is the one we just came from
            // first get all exits
            const exitObjects = this.creep.room.find(FIND_EXIT);
            // then get the exit closest to the creep
            const closestExitTile = this.creep.pos.findClosestByPath(exitObjects);
            const closestExit = this.getExitRoomName(closestExitTile);
            // save it to creep's memory
            if (closestExit) {
                this.creep.memory.previousRoom = closestExit.roomName;
            }
        }
        if (this.creep.memory.targetExit) {
            if (this.creep.memory.targetExit === this.creep.room.name) {
                delete this.creep.memory.targetExit;
                return;
            }
            const target = new RoomPosition(25, 25, this.creep.memory.targetExit);
            const moveResult = this.creep.moveTo(target);
            if (moveResult === ERR_NO_PATH) {
                delete this.creep.memory.targetExit;
            }
            return;
        }

        // get all exits
        const exitObjects = this.creep.room.find(FIND_EXIT);
        const exitObjectRoomNames = exitObjects.map((e) => this.getExitRoomName(e));
        // filter duplicates
        let exitNames = [...new Set(exitObjectRoomNames)];
        // console.log(`exitNames: ${exitNames}`);
        //randomize the array
        exitNames = exitNames.sort(() => 0.5 - Math.random());
        // sort rooms that match any rooms in Memory.rooms to the end of the array
        exitNames = exitNames.sort((a, b) => {
            if (Memory.rooms[a] && Memory.rooms[a].lastScoutTime) {
                return 1;
            } else if (Memory.rooms[b] && Memory.rooms[b].lastScoutTime) {
                return -1;
            } else {
                return 0;
            }
        });
        // sort rooms that have hostile creeps to the end of the array
        exitNames = exitNames.sort((a, b) => {
            if (Memory.rooms[a] && Memory.rooms[a].hostiles && Memory.rooms[a].hostiles.length > 0) {
                return 1;
            } else if (Memory.rooms[b] && Memory.rooms[b].hostiles && Memory.rooms[b].hostiles.length > 0) {
                return -1;
            } else {
                return 0;
            }
        });
        // sort rooms that have hostile towers to the end of the array
        exitNames = exitNames.sort((a, b) => {
            if (Memory.rooms[a] && Memory.rooms[a].hostileTowers && Memory.rooms[a].hostileTowers.length > 0) {
                return 1;
            } else if (Memory.rooms[b] && Memory.rooms[b].hostileTowers && Memory.rooms[b].hostileTowers.length > 0) {
                return -1;
            } else {
                return 0;
            }
        });
        // sort any that match this.creep.memory.previousRoom to end of the array
        exitNames = exitNames.sort((a, b) => {
            if (a === this.creep.memory.previousRoom) {
                return 1;
            } else if (b === this.creep.memory.previousRoom) {
                return -1;
            } else {
                return 0;
            }
        });

        let target = new RoomPosition(25, 25, exitNames[0]);
        let moveResult = this.creep.moveTo(target);
        while (moveResult === ERR_NO_PATH && exitNames.length > 1) {
            exitNames.shift();
            target = new RoomPosition(25, 25, exitNames[0]);
            moveResult = this.creep.moveTo(target);
        }
        this.creep.memory.targetExit = target.roomName;
        return;
    }
    gatherIntel() {
        let room = this.creep.room;

        // If the room has not been scouted before or it's been a while since last scout
        if (!Memory.rooms[room.name] || Game.time - Memory.rooms[room.name].lastScoutTime > 1000) {
            Memory.rooms[room.name] = {
                lastScoutTime: Game.time,
            };

            // Record sources
            let sources = room.find(FIND_SOURCES);
            Memory.rooms[room.name].sources = sources.map((s) => {
                // get all of the positions around the source
                const positionsAroundSource = [];
                for (let x = s.pos.x - 1; x <= s.pos.x + 1; x++) {
                    for (let y = s.pos.y - 1; y <= s.pos.y + 1; y++) {
                        positionsAroundSource.push(new RoomPosition(x, y, room.name));
                    }
                }
                return {
                    id: s.id,
                    pos: s.pos,
                    around: positionsAroundSource,
                };
            });

            // Record minerals
            let minerals = room.find(FIND_MINERALS);
            Memory.rooms[room.name].minerals = minerals.map((m) => ({
                id: m.id,
                pos: m.pos,
                mineralType: m.mineralType,
            }));

            // Record controller
            let controller = room.controller;
            if (controller) {
                Memory.rooms[room.name].controller = {
                    id: controller.id,
                    pos: controller.pos,
                    owner: controller.owner,
                    level: controller.level,
                    progress: controller.progress,
                };
            }

            // Record hostile creeps
            let hostiles = room.find(FIND_HOSTILE_CREEPS);
            Memory.rooms[room.name].hostiles = hostiles.map((h) => ({
                id: h.id,
                pos: h.pos,
                owner: h.owner.username,
            }));

            // Record walls
            let walls = room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType === STRUCTURE_WALL,
            });
            Memory.rooms[room.name].walls = walls.map((w) => w.pos);

            // Record roads
            let roads = room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType === STRUCTURE_ROAD,
            });
            Memory.rooms[room.name].roads = roads.map((r) => r.pos);

            // Record hostile towers
            let hostileTowers = room.find(FIND_HOSTILE_STRUCTURES, {
                filter: (structure) => structure.structureType === STRUCTURE_TOWER,
            });
            Memory.rooms[room.name].hostileTowers = hostileTowers.map((t) => ({
                id: t.id,
                pos: t.pos,
            }));

            // Record terrain data - This can be a lot of data, so be cautious.
            // let terrain = new Room.Terrain(room.name);
            // let wallCount = 0;
            // let swampCount = 0;
            // for (let x = 0; x < 50; x++) {
            //     for (let y = 0; y < 50; y++) {
            //         let tile = terrain.get(x, y);
            //         if (tile === TERRAIN_MASK_WALL) {
            //             wallCount++;
            //         } else if (tile === TERRAIN_MASK_SWAMP) {
            //             swampCount++;
            //         }
            //     }
            // }
            // Memory.rooms[room.name].terrain = {
            //     walls: wallCount,
            //     swamps: swampCount,
            // };

            // Record exits
            let exits = [];
            let exitObjects = room.find(FIND_EXIT);
            for (let exitObject of exitObjects) {
                exits.push(this.getExitRoomName(exitObject));
            }
            Memory.rooms[room.name].exits = exits;
        }
    }
    getExitRoomName(exitTile) {
        // Get all neighboring rooms from the current room
        let neighboringRooms = Game.map.describeExits(exitTile.roomName);

        // Check the exit tile's position to determine the room it leads to
        if (exitTile.x === 0) {
            return neighboringRooms[LEFT];
        } else if (exitTile.x === 49) {
            return neighboringRooms[RIGHT];
        } else if (exitTile.y === 0) {
            return neighboringRooms[TOP];
        } else if (exitTile.y === 49) {
            return neighboringRooms[BOTTOM];
        } else {
            return null; // Not a valid exit tile
        }
    }
}

export default Scout;
