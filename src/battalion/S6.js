class BattalionS6 {
    /* (Signal/Communications): Manages communications and IT
     * Handle inter-room communication or possibly coordination with allies.
     */
    constructor(battalion) {
        this.battalion = battalion;
        this.minerals = this.battalion.s4.report("minerals");
    }
    run() {
        // Do S6 stuff
        this.recordMarketOrders();
    }
    recordMarketOrders() {
        if (Game.time % 100 === 0) {
            const allMarketOrders = this.getMarketOrders();
            const filteredMarketOrders = this.getMarketOrders(Object.keys(this.minerals));
            if (!Memory.market) {
                Memory.market = {
                    orders: {
                        all: [],
                        potential: [],
                    },
                };
            }
            if (!Memory.market.orders) {
                Memory.market.orders = {
                    all: [],
                    potential: [],
                };
            }
            Memory.market.orders.all = allMarketOrders;
            Memory.market.orders.potential = filteredMarketOrders;
            if (filteredMarketOrders.length > 0) {
                this.recordQualifiedOrders();
            }
        }
    }
    recordQualifiedOrders() {
        Memory.market.qualifiedOrders = [];
        if (Memory.market.orders.potential.length === 0) {
            return;
        }
        Memory.market.orders.potential.forEach((order) => {
            // get all my rooms
            const myRooms = Object.values(Game.rooms).filter((room) => room.controller && room.controller.my);
            myRooms.forEach((room) => {
                const roomEnergyStorage = room.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => structure.structureType === STRUCTURE_STORAGE,
                })[0].store[RESOURCE_ENERGY];
                const energyCost = Game.market.calcTransactionCost(order.remainingAmount, room.name, order.roomName);
                if (!roomEnergyStorage > energyCost) {
                    return;
                }
                const roomMineralStorage = room.find(FIND_MY_STRUCTURES, {
                    filter: (structure) => structure.structureType === STRUCTURE_STORAGE,
                })[0].store[order.resourceType];
                if (!roomMineralStorage > order.remainingAmount) {
                    return;
                }
                const isMyOrder = Game.market.orders[order.id] ? true : false;
                if (order.price < 0.01 || isMyOrder) {
                    return;
                }
                const existingOrder = Memory.market.qualifiedOrders.find((o) => o.id === order.id);
                if (existingOrder) {
                    const existingOrder = Memory.market.qualifiedOrders.find((o) => o.id === order.id);
                    if (existingOrder.energyCost < energyCost) {
                        return;
                    }
                }
                order.energyCost = energyCost;
                order.bestRoom = room.name;
                const roomAlreadyHasOrder = Memory.market.qualifiedOrders.find((o) => o.bestRoom === room.name);
                if (roomAlreadyHasOrder) {
                    return;
                } else {
                    Memory.market.qualifiedOrders.push(order);
                }
            });
        });
        this.issueActiveOrders();
    }
    issueActiveOrders() {
        if (Memory.market.qualifiedOrders.length === 0) {
            return;
        }
        // create an array where bestRoom in Memory.market.qualifiedOrders has to be unique, i.e. only one active order per best room
        let activeOrders = [];
        Memory.market.qualifiedOrders.forEach((order) => {
            const listAlreadyHasOrder = activeOrders.some((o) => o.bestRoom === order.bestRoom);
            const roomAlreadyHasOrder = Memory.rooms[order.bestRoom].activeOrder;
            if (!listAlreadyHasOrder && !roomAlreadyHasOrder) {
                activeOrders.push(order);
            }
        });
        if (activeOrders.length === 0) {
            return;
        }
        Memory.market.activeOrders = activeOrders;
        activeOrders.forEach((order) => {
            Memory.rooms[order.bestRoom].activeOrder = order;
        });
    }
    getMarketOrders(products) {
        let orders = Game.market.getAllOrders();
        if (products) {
            orders = orders.filter((order) => {
                return products.includes(order.resourceType) && order.type === ORDER_BUY && order.amount > 0;
            });
        }
        return orders;
    }
}

export default BattalionS6;
