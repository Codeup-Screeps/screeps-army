import Claimer from "../roles/Claimer";
class BattalionS5 {
    /* (Future Plans) Plans for future operations and strategy
     *  Manage longer-term plans, like which rooms to attack or colonize next, or how to expand the company/room
     */
    constructor(battalion) {
        this.battalion = battalion;
    }
    run() {
        // Do S5 stuff
        if (Game.time % 500 === 0 && !Memory.nextClaim) {
            this.getSurroundingRooms();
        }
        this.identifyNextRoomClaim();
        if (Memory.nextClaim) {
            // console.log(`Next Claim: ${Memory.nextClaim}`);
            if (Game.creeps["claimer"]) {
                new Claimer(Game.creeps["claimer"]).run();
            } else {
                this.recruitClaimer();
            }
        }
    }
    identifyNextRoomClaim() {
        // console.log(`Battalion Rooms: ${this.battalion.rooms.length}/${this.battalion.gcl.level}`);
        if (parseFloat(this.battalion.gcl.level) == this.battalion.rooms.length) {
            Memory.nextClaim = null;
            return;
        }
        let nextRoom = null;
        // if there's a flag called "Claim" in a room, that's the next room to claim
        const claimFlags = Object.values(Game.flags).filter((flag) => flag.name.includes("Claim"));
        if (claimFlags.length > 0) {
            nextRoom = claimFlags[0].pos.roomName;
            if (nextRoom.includes("_")) {
                nextRoom = nextRoom.split("_")[0];
            }
            if (nextRoom.includes("-")) {
                nextRoom = nextRoom.split("-")[0];
            }
            Memory.nextClaim = nextRoom;
            // get name
            let baseType = claimFlags[0].name.split("-")[1];
            if (baseType) {
                Memory.rooms[nextRoom].base = baseType;
            } else {
                baseType = claimFlags[0].name.split("_")[1];
                if (baseType) {
                    Memory.rooms[nextRoom].base = baseType;
                }
            }
            return;
        }
    }
    getSurroundingRooms() {
        // get all rooms that surround the battalion's rooms
        const surroundingRooms = [];
        for (let room of this.battalion.rooms) {
            const exitObjects = room.find(FIND_EXIT);
            const exitObjectRoomNames = exitObjects.map((e) => this.getExitRoomName(e));
            // filter duplicates
            const exits = [...new Set(exitObjectRoomNames)];
            for (let exit of exits) {
                if (!this.battalion.rooms.includes(exit)) {
                    surroundingRooms.push(exit);
                }
            }
        }
        Memory.surroundingRooms = surroundingRooms;
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
    recruitClaimer() {
        const availableSpawns = this.battalion.spawns.filter((spawn) => !spawn.spawning);
        if (availableSpawns.length === 0) {
            return;
        }
        if (availableSpawns[0].room.energyAvailable < 1300) {
            return;
        }
        // Recruit a new Soldier
        const newName = "claimer";
        const loadout = [CLAIM, CLAIM, MOVE, MOVE];
        availableSpawns[0].spawnCreep(loadout, newName, {
            memory: { role: "claimer", battalion: this.battalion.name },
        });
    }
}

export default BattalionS5;
