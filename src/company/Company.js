import { CompanyS1, CompanyS2, CompanyS3, CompanyS4, CompanyS5, CompanyS6 } from "./index";
import { Tower } from "../structures/index";

class Company {
    constructor(name, battalion) {
        this.name = name;
        this.room = Game.rooms[name];
        this.battalion = battalion;
        this.soldiers = this.battalion.soldiers.filter((soldier) => soldier.creep.memory.company === this.name);
        this.spawns = this.room.find(FIND_MY_SPAWNS);
        this.extensions = this.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTENSION },
        });
        this.sources = this.room.find(FIND_SOURCES);
        // this.report();
        this.s1 = new CompanyS1(this); // (Personnel) Manages human resources
        this.s2 = new CompanyS2(this); // (Intelligence) Gathers and analyzes intelligence
        this.s3 = new CompanyS3(this); // (Operations) Plans and organizes missions
        this.s4 = new CompanyS4(this); // (Logistics) Manages supply chains and maintenance
        this.s5 = new CompanyS5(this); // (Future Plans) Plans for future operations and strategy
        this.s6 = new CompanyS6(this); // (Signal/Communications) Manages communications and IT
    }
    run() {
        // Run Staff Offices
        this.s1.run();
        this.s2.run();
        this.s3.run();
        this.s4.run();
        this.s5.run();
        this.s6.run();
        // Run towers
        const towers = this.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_TOWER },
        });
        for (let tower of towers) {
            new Tower(tower).run();
        }
    }
    report() {
        console.log(`Company(${this.name}) Report:`);
        console.log(`  Soldiers: ${this.soldiers.length}`);
        console.log(`  Spawns: ${this.spawns.length}`);
        console.log(`  Extensions: ${this.extensions.length}`);
        console.log(`  Sources: ${this.sources.length}`);
    }
}

export default Company;
