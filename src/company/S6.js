class CompanyS6 {
    /* (Signal/Communications): Manages communications and IT
     * Handle inter-room communication or possibly coordination with allies. Handle labs.
     */
    constructor(company) {
        this.company = company;
        this.room = this.company.room;
    }
    run() {
        // Do S6 stuff
        const labs = this.room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_LAB } });
        // console.log(`S6(${this.company.name}) Labs: ${labs.length}`);
        if (labs.length === 0) {
            return;
        }
        labs[0].runReaction(labs[1], labs[2]);
    }
}

export default CompanyS6;
