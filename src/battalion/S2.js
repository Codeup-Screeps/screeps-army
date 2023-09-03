class BattalionS2 {
    /* (Intelligence) Gathers and analyzes intelligence
     *  Manage scouting operations, monitoring other players, and keeping track of hostile movements.
     */
    constructor(battalion) {
        this.battalion = battalion;
        // get all spawns
        this.spawns = this.battalion.spawns;
    }
    run() {
        // Do S2 stuff
        if (Game.time % 2000 === 0) {
            this.sendScout();
        }
    }
    sendScout() {
        // pick a random spawn that isn't currently spawning
        const availableSpawns = this.spawns.filter((spawn) => !spawn.spawning);
        if (availableSpawns.length === 0) {
            return;
        }
        // Recruit a scout
        const spawn = availableSpawns[Math.floor(Math.random() * availableSpawns.length)];
        const name = "Scout" + Game.time;
        const body = [MOVE];
        spawn.spawnCreep(body, name, {
            memory: { role: "scout", company: "hhc" },
        });
        return;
    }
}

export default BattalionS2;
