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
        const orders = this.room.memory.orders;
        if (orders) {
            const filledOrder = orders.find((order) => order.status === "filled");
            if (filledOrder) {
                const terminal = this.room.terminal;
                if (terminal) {
                    const amount = filledOrder.amount;
                    const resource = filledOrder.resource;
                    const result = terminal.send(resource, amount, filledOrder.target);
                    console.log(`${this.room.name} Company S6 sending ${amount} ${resource} to ${filledOrder.target}.`);
                    // console.log(result);
                    if (result === OK) {
                        filledOrder.status = "sent";
                    }
                }
            }
        }
    }
}

export default CompanyS6;
