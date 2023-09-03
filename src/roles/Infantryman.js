import Soldier from "./Soldier";

class Infantryman extends Soldier {
    constructor(creep) {
        super(creep.name);
        this.creep = creep;
    }
    run() {
        // Do infantryman stuff
    }
}

export default Infantryman;
