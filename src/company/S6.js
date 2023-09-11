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
    }
}

export default CompanyS6;
