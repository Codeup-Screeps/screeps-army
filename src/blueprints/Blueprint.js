import { SmallFOB, Bunker } from "./index";

class Blueprint {
    // Blueprints built using Screeps Building Planner: https://screeps.arcath.net/building-planner
    constructor(type, pos, room) {
        if (!type) throw new Error("Blueprint type not specified");
        if (!pos) throw new Error("Blueprint position not specified");
        if (!room) throw new Error("Blueprint room not specified");
        this.blueprint = this.getBlueprint(type, pos);
        this.room = room;
    }
    getBlueprint(type, pos) {
        let bp;
        switch (type) {
            case "SmallFOB":
                bp = new SmallFOB(pos);
                break;
            case "Bunker":
                bp = new Bunker(pos);
                break;
            default:
                bp = new SmallFOB(pos);
                break;
        }
        if (!bp) throw new Error("Blueprint not found");
        const adjustedBp = this.adjustBlueprint(bp.startingPoint, pos, bp);
        return adjustedBp;
    }
    adjustBlueprint(oldStart, newStart, blueprint) {
        const xOffset = newStart.x - oldStart.x;
        const yOffset = newStart.y - oldStart.y;

        return this.transformBlueprint(blueprint, xOffset, yOffset);
    }
    transformBlueprint(bp, xOffset, yOffset) {
        let transformedBlueprint = {};

        for (let structureType in bp) {
            if (structureType === "startingPoint") continue;
            transformedBlueprint[structureType] = {
                pos: bp[structureType].pos.map((pos) => {
                    return { x: pos.x + xOffset, y: pos.y + yOffset };
                }),
            };
        }

        return transformedBlueprint;
    }
    build() {
        for (let structureType in this.blueprint) {
            if (structureType === "roadConnectPoints") continue;
            this.blueprint[structureType].pos.forEach((pos) => {
                // if this loc is a wall, skip it
                if (this.room.lookForAt(LOOK_TERRAIN, pos.x, pos.y)[0] === "wall") return;
                this.room.createConstructionSite(pos.x, pos.y, structureType);
            });
        }
        return this;
    }
    getDimensions() {
        let minX = 50;
        let minY = 50;
        let maxX = 0;
        let maxY = 0;

        for (let structureType in this.blueprint) {
            if (structureType === "startingPoint") continue;
            this.blueprint[structureType].pos.forEach((pos) => {
                if (pos.x < minX) minX = pos.x;
                if (pos.y < minY) minY = pos.y;
                if (pos.x > maxX) maxX = pos.x;
                if (pos.y > maxY) maxY = pos.y;
            });
        }

        return {
            width: maxX - minX + 1,
            height: maxY - minY + 1,
        };
    }
    buildRoadsToSources() {
        // build roads to sources
        const sources = this.room.find(FIND_SOURCES);
        const roadConnectors = this.blueprint.roadConnectPoints.pos.map((pos) => new RoomPosition(pos.x, pos.y, this.room.name));
        for (let source of sources) {
            const path = this.determineBestPath(roadConnectors, source);
            this.buildRoadAlongPath(path);
        }
        return this;
    }
    buildRoadsToController() {
        // build roads to controller
        const controller = this.room.controller;
        const roadConnectors = this.blueprint.roadConnectPoints.pos.map((pos) => new RoomPosition(pos.x, pos.y, this.room.name));
        const path = this.determineBestPath(roadConnectors, controller);
        this.buildRoadAlongPath(path);
        return this;
    }
    determineBestPath(pointsArr, destination) {
        // find the bunker exit with least cost from the PathFinder object
        let bestPath = pointsArr.reduce((min, exit) => {
            let path = PathFinder.search(exit, destination, { plainCost: 2, swampCost: 3 });
            if (path.cost < min.cost) {
                return path;
            } else {
                return min;
            }
        }, PathFinder.search(pointsArr[0], destination, { plainCost: 2, swampCost: 3 }));
        return bestPath;
    }
    buildRoadAlongPath(path) {
        for (let pos of path.path) {
            this.room.createConstructionSite(pos.x, pos.y, STRUCTURE_ROAD);
        }
    }
}

export default Blueprint;
