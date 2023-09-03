import Soldier from "./Soldier";

class Rifleman extends Soldier {
    constructor(creep) {
        super(creep.name);
        this.creep = creep;
    }
    run() {
        // Do rifleman stuff
    }
}

export default Rifleman;
