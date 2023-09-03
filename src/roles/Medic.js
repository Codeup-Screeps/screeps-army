import Soldier from "./Soldier";

class Medic extends Soldier {
    constructor(creep) {
        super(creep.name);
        this.creep = creep;
    }
    run() {
        // Do medic stuff
    }
}

export default Medic;
