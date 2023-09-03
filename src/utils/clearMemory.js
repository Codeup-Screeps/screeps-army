const clearMemory = () => {
    // Loop through each creep's name in Memory.creeps
    for (var creepName in Memory.creeps) {
        // If the creep's name isn't in Game.creeps
        if (!Game.creeps[creepName]) {
            // Remove it from the memory and log that it did so
            delete Memory.creeps[creepName];
            // console.log("Clearing non-existing creep memory:", creepName);
        }
    }
};

export default clearMemory;
