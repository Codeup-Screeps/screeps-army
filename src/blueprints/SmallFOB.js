class SmallFOB {
    // https://screepers.github.io/screeps-tools/?share=N4IgTgxgNiBcAcAaEAjArgSygEwwOwHMBnOUIgBwEMB3POAbVAA84AmAZmQE84BGdgL4BdZGAD2lbA2ZtOIHrF6sBiGbFatufQapAt1vLYoAsKtRqO8ArGb2zLANlv7Wxyzd0url057Zv5bWc2AAZLHXMwwMVlPwNLXmD1TWjeRLjXBKTWb1T08wdLWILw7MLUjxLUpwzchV4AdmyA+qaMlNbsw1S2yMdsqPrKu3VBvnyR1nL6iZdpvl7JscUmkRAAUyYAF3W8IgwxOlhGSY6+Ysnu+ouXK6CMu8Vh2-721-MWvhrzOq-s36e-1KtSKzVBayIWzEYEoBHW0kmciGwmQUOo6zACJcSL4vj6qTxiKyGXmJmyOJWKJAUHwAGssWwzmS1jswABbfCUGDHD4+KkQQ6QsBoCA7bAAdS53JOLmWvBCXUsCreqWVvNVQI1JKV2QaxPMetSNzYhvqEUmpr4zxN7wtlkWc0s8E19WdGU+ijd5iZvC9lydAwDcV4AE57UlQ7b9JGKhGw6lzdH49c41khAIBEA#/building-planner
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
                { x: 20, y: 13 },
                { x: 20, y: 12 },
                { x: 21, y: 11 },
                { x: 22, y: 11 },
                { x: 24, y: 11 },
                { x: 25, y: 11 },
                { x: 26, y: 12 },
                { x: 26, y: 13 },
                { x: 26, y: 15 },
                { x: 26, y: 16 },
                { x: 25, y: 17 },
                { x: 24, y: 17 },
                { x: 22, y: 17 },
                { x: 21, y: 17 },
                { x: 20, y: 16 },
                { x: 20, y: 15 },
                { x: 20, y: 11 },
                { x: 26, y: 11 },
                { x: 26, y: 17 },
                { x: 20, y: 17 },
            ],
        };
        (this.extension = {
            pos: [
                { x: 22, y: 12 },
                { x: 21, y: 12 },
                { x: 21, y: 13 },
                { x: 21, y: 15 },
                { x: 21, y: 16 },
                { x: 22, y: 16 },
                { x: 24, y: 16 },
                { x: 25, y: 16 },
                { x: 25, y: 15 },
                { x: 25, y: 13 },
                { x: 25, y: 12 },
                { x: 24, y: 12 },
            ],
        }),
            (this.storage = {
                pos: [{ x: 23, y: 15 }],
            });
        this.tower = {
            pos: [
                { x: 23, y: 14 },
                { x: 20, y: 14 },
                { x: 23, y: 11 },
                { x: 26, y: 14 },
                { x: 23, y: 17 },
            ],
        };
        this.link = { pos: [{ x: 22, y: 14 }] };
        this.terminal = { pos: [{ x: 24, y: 14 }] };
    }
}

export default SmallFOB;
