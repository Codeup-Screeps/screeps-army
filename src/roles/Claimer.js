import Soldier from "./Soldier";

class Claimer extends Soldier {
    constructor(creep) {
        super(creep.name);
        this.creep = creep;
    }
    run() {
        this.creep.memory.targetRoom = Memory.nextClaim;
        if (this.creep.room.name !== this.creep.memory.targetRoom) {
            this.creep.moveTo(new RoomPosition(25, 25, this.creep.memory.targetRoom));
        } else {
            const controller = this.creep.room.controller;
            if (controller) {
                if (this.creep.claimController(controller) == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(controller);
                }
            }
        }
    }
}

export default Claimer;
