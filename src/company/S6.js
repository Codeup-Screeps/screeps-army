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
                // console.log(`Terminal: ${terminal}`);
                if (terminal) {
                    const amount = filledOrder.amount;
                    const resource = filledOrder.resource;
                    const result = terminal.send(resource, amount, filledOrder.target);
                    // console.log(result);
                    if (result === 0) {
                        console.log(`Company S6: ${this.room.name} Company S6 sending ${amount} ${resource} to ${filledOrder.target}.`);
                        filledOrder.status = "sent";
                        // delete filledOrder;
                        console.log(`Company S6: Order ${filledOrder.id} removed`);
                        this.room.memory.orders = [];
                    }
                }
            }
        }
    }
}

export default CompanyS6;
