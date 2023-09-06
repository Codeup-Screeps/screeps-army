class SmallFOB {
    // https://screepers.github.io/screeps-tools/?share=N4IgTgxgNiBcCsAaEAjArgSygEwwOwHMBnOUIgBwEMB3POAbVAA84AmAZmQE84BGdgL4BdZGAD2lbA2ZtOIHrF6sBiGbFatufQapAt1vLYoAsKtRqO94ZvbMsA2G-tbHL13c6Ty+pj21feijrmcgq8vE52gbwA7JHq9pa+5jFJ8awADGl+igCc2eaa0RnphsXpWdERObz50co1dWHBtuoBYSU5rF4d6YlV6an1g5YtzkNh7ikOfZZxXT18ABzp7cvpRWErXWVbFXPxtTONbodLBa0cRrnp59HJl6F8N11P6p1qsRfOb9vmTT4RtE-q0jsCgb0TuURCAAKZMAAusLwRAwYjosEYl02fGq5l2uI2lga+OJ+2GO1G5OapVOXUqk2pfEclOiLNJ0XmhWO3M5qx5lzWii5l0WwvSYt47Mu-TC0ucsr4U1FdPMkrGbEVQVmFLVljxKt1grJXSF4XSb14H0elhWMKICLEYEoBFh0ht0WsMMd1FhYHdP2+-jSMIg6IRlHwfoDzyD6gmgJhUHwAGsY+ocSZhAIBEA#/building-planner
    constructor() {
        this.startingPoint = { x: 23, y: 13 }; // Original starting point in the blueprint
        this.roadConnectPoints = {
            pos: [
                { x: 23, y: 8 },
                { x: 27, y: 10 },
                { x: 29, y: 14 },
                { x: 27, y: 18 },
                { x: 23, y: 20 },
                { x: 19, y: 18 },
                { x: 17, y: 14 },
                { x: 19, y: 10 },
            ],
        };
        this.spawn = {
            pos: [{ x: 23, y: 13 }],
        };
        this.road = {
            pos: [
                { x: 23, y: 12 },
                { x: 22, y: 13 },
                { x: 21, y: 14 },
                { x: 22, y: 15 },
                { x: 23, y: 16 },
                { x: 24, y: 15 },
                { x: 25, y: 14 },
                { x: 24, y: 13 },
                { x: 23, y: 11 },
                { x: 23, y: 17 },
                { x: 26, y: 14 },
                { x: 27, y: 14 },
                { x: 20, y: 14 },
                { x: 19, y: 14 },
                { x: 22, y: 10 },
                { x: 21, y: 10 },
                { x: 20, y: 11 },
                { x: 19, y: 12 },
                { x: 19, y: 13 },
                { x: 24, y: 10 },
                { x: 25, y: 10 },
                { x: 26, y: 11 },
                { x: 27, y: 12 },
                { x: 27, y: 13 },
                { x: 27, y: 15 },
                { x: 27, y: 16 },
                { x: 26, y: 17 },
                { x: 25, y: 18 },
                { x: 24, y: 18 },
                { x: 22, y: 18 },
                { x: 21, y: 18 },
                { x: 20, y: 17 },
                { x: 19, y: 16 },
                { x: 19, y: 15 },
                { x: 18, y: 14 },
                { x: 23, y: 9 },
                { x: 28, y: 14 },
                { x: 23, y: 19 },
                { x: 23, y: 20 },
                { x: 17, y: 14 },
                { x: 23, y: 8 },
                { x: 29, y: 14 },
                { x: 27, y: 18 },
                { x: 19, y: 18 },
                { x: 27, y: 10 },
                { x: 19, y: 10 },
            ],
        };
        this.extension = {
            pos: [
                { x: 22, y: 11 },
                { x: 21, y: 11 },
                { x: 22, y: 12 },
                { x: 21, y: 12 },
                { x: 20, y: 12 },
                { x: 21, y: 13 },
                { x: 20, y: 13 },
                { x: 21, y: 15 },
                { x: 20, y: 15 },
                { x: 20, y: 16 },
                { x: 21, y: 16 },
                { x: 21, y: 17 },
                { x: 22, y: 16 },
                { x: 22, y: 17 },
                { x: 24, y: 16 },
                { x: 24, y: 17 },
                { x: 25, y: 17 },
                { x: 25, y: 16 },
                { x: 26, y: 16 },
                { x: 26, y: 15 },
                { x: 25, y: 15 },
                { x: 25, y: 13 },
                { x: 26, y: 13 },
                { x: 26, y: 12 },
                { x: 25, y: 11 },
                { x: 25, y: 12 },
                { x: 24, y: 12 },
                { x: 24, y: 11 },
                { x: 23, y: 10 },
                { x: 23, y: 18 },
            ],
        };
        this.storage = {
            pos: [{ x: 23, y: 15 }],
        };
        this.tower = {
            pos: [
                { x: 23, y: 14 },
                { x: 24, y: 14 },
            ],
        };
        this.container = {
            pos: [
                { x: 19, y: 14 },
                { x: 27, y: 14 },
            ],
        };
        this.link = {
            pos: [{ x: 22, y: 14 }],
        };
    }
}

export default SmallFOB;
