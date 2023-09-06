const MINERAL_COMBINATIONS = {
    baseMinerals: ["H", "O", "Z", "K", "L", "U", "X"],

    tier1: {
        OH: ["O", "H"], // Hydroxide
        ZK: ["Z", "K"], // Zynthium Keanite
        UL: ["U", "L"], // Utrium Leprite
        UO: ["U", "O"], // Utrium Oxide
        KH: ["K", "H"], // Keanium Hydride
        LO: ["L", "O"], // Lemergium Oxide
        ZO: ["Z", "O"], // Zynthium Oxide
        G: ["Z", "H"], // Ghodium
        GH: ["G", "H"], // Ghodium Hydride
        UH: ["U", "H"], // Utrium Hydride
        UZ: ["U", "Z"], // Utrium Zynthide
    },

    tier2: {
        LH: ["L", "OH"], // Lemergium Hydroxide
        KH: ["K", "OH"], // Keanium Hydroxide
        ZH: ["Z", "OH"], // Zynthium Hydroxide
        GH: ["G", "OH"], // Ghodium Hydroxide
        UH: ["U", "OH"], // Utrium Hydroxide
        UZ: ["U", "ZK"], // Utrium Zynthide Keanite
        GHO2: ["GH", "O"], // Ghodium Acid
        KHO2: ["KH", "O"], // Keanium Acid
        LHO2: ["LH", "O"], // Lemergium Acid
        UHO2: ["UH", "O"], // Utrium Acid
    },

    tier3: {
        LHO2: ["L", "GHO2"], // Lemergium Alkalide
        KHO2: ["K", "LHO2"], // Keanium Alkalide
        ZHO2: ["Z", "KHO2"], // Zynthium Alkalide
        UHO2: ["U", "ZHO2"], // Utrium Alkalide
        GHO2: ["G", "UHO2"], // Ghodium Alkalide
        LH2O: ["L", "LHO2"], // Concentrated Lemergium
        KH2O: ["K", "KHO2"], // Concentrated Keanium
        ZH2O: ["Z", "ZHO2"], // Concentrated Zynthium
        UH2O: ["U", "UHO2"], // Concentrated Utrium
        GH2O: ["G", "GHO2"], // Concentrated Ghodium
        XUHO2: ["X", "UHO2"], // Catalyzed Utrium Alkalide
        XGHO2: ["X", "GHO2"], // Catalyzed Ghodium Alkalide
        XLHO2: ["X", "LHO2"], // Catalyzed Lemergium Alkalide
        XKHO2: ["X", "KHO2"], // Catalyzed Keanium Alkalide
        XZH2O: ["X", "ZH2O"], // Catalyzed Zynthium Alkalide
        XUH2O: ["X", "UH2O"], // Catalyzed Utrium Acid
        XGH2O: ["X", "GH2O"], // Catalyzed Ghodium Acid
        XLH2O: ["X", "LH2O"], // Catalyzed Lemergium Acid
        XKH2O: ["X", "KH2O"], // Catalyzed Keanium Acid
    },
};

// Usage example:
function getComponentsForCompound(compound) {
    for (let tier in MINERAL_COMBINATIONS) {
        if (MINERAL_COMBINATIONS[tier][compound]) {
            return MINERAL_COMBINATIONS[tier][compound];
        }
    }
    return null; // Compound not found
}

// console.log(getComponentsForCompound("UH")); // Outputs: ['U', 'OH']

export { MINERAL_COMBINATIONS, getComponentsForCompound };
