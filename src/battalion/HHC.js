class HHC {
    /* Headquaters & Headquaters Company
     *  This is the top level company of the battalion. It manages the special teams and roles assigned to the battalion level.
     */
    constructor(battalion) {
        this.name = "HHC";
        this.battalion = battalion;
        const creepNames = Object.keys(Game.creeps);
        this.soldiers = creepNames.map((name) => this.battalion.getSoldierRole(Game.creeps[name]));
    }
    run() {
        // Do HHC things
    }
}

export default HHC;
