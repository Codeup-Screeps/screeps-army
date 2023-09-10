import clearMemory from "./utils/clearMemory";
import Battalion from "./battalion/Battalion";
import Statistics from "./stats/Statistics";

function loop() {
    // Clear memory
    clearMemory();
    // Run my Battalion
    const battalion = new Battalion(Game).run();
    // Run my Statistics
    new Statistics().run();
}

export { loop };
