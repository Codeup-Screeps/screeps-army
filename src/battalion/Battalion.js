import Company from "../company/Company";
import { Engineer, Hauler, Infantryman, Medic, Rifleman, Sapper, Scout, Miner } from "../roles/index";
import { HHC, BattalionS1, BattalionS2, BattalionS3, BattalionS4, BattalionS5, BattalionS6 } from "./index";

class Battalion {
    constructor(game) {
        this.game = game;
        const creepNames = Object.keys(Game.creeps);
        this.soldiers = creepNames.map((name) => this.getSoldierRole(Game.creeps[name]));
        this.spawns = Object.values(Game.spawns);
        this.rooms = Object.values(Game.rooms).filter((room) => room.controller && room.controller.my);
        this.gcl = Game.gcl;
        this.hhc = new HHC(this); // (Headquarters and Headquarters Company) Manages battalion special operations staff
        this.s1 = new BattalionS1(this); // (Personnel) Manages human resources
        this.s2 = new BattalionS2(this); // (Intelligence) Gathers and analyzes intelligence
        this.s3 = new BattalionS3(this); // (Operations) Plans and organizes missions
        this.s4 = new BattalionS4(this); // (Logistics) Manages supply chains and maintenance
        this.s5 = new BattalionS5(this); // (Future Plans) Plans for future operations and strategy
        this.s6 = new BattalionS6(this); // (Signal/Communications) Manages communications and IT
        const myRooms = Object.values(Game.rooms).filter((room) => room.controller && room.controller.my);
        this.companies = myRooms.map((room) => new Company(room.name, this));
    }
    run() {
        // Run Staff Offices
        this.s1.run();
        this.s2.run();
        this.s3.run();
        this.s4.run();
        this.s5.run();
        this.s6.run();

        // Run Companies
        for (let company of this.companies) {
            company.run();
        }
        // Run Soldiers
        for (let soldier of this.soldiers) {
            soldier.run();
        }
    }
    getSoldierRole(creep) {
        const role = creep.memory.role;
        switch (role) {
            case "engineer":
                return new Engineer(creep);
            case "hauler":
                return new Hauler(creep);
            case "infantryman":
                return new Infantryman(creep);
            case "medic":
                return new Medic(creep);
            case "rifleman":
                return new Rifleman(creep);
            case "sapper":
                return new Sapper(creep);
            case "scout":
                return new Scout(creep);
            case "miner":
                return new Miner(creep);
            default:
                return new Infantryman(creep);
        }
    }
}

export default Battalion;
