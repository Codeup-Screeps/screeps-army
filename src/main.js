import clearMemory from "./utils/clearMemory";
import Battalion from "./battalion/Battalion";

function loop() {
    // Clear memory
    clearMemory();
    // Run my Battalion
    const battalion = new Battalion(Game).run();
}

export { loop };
