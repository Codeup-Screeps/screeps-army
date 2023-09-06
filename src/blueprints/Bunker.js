class Bunker {
    // https://screepers.github.io/screeps-tools/?share=N4IgTgxgNiBcAcAaEAjArgSygEwwOwHMBnOUMAewENs4BtUADzgCZnkBPOARgAYBfRIxYBmDty4ChsZgBYxsLs0kgm0gKzyuw5atmaZOkZrWHpbEJwUA2U8y7HbPfaa4BOTdsEqWTi9yVeuvZ+ChKBLMGWXAbhZh62oiHRLkhJAVJcAOyaYRmpUfyxbvKujvLwtpFwpbHMiZY1UnohFbUaIY3e0laahU3ZSbldzD1ptqNRMf0OtRPcNm2ambZySa1N9dzLtVUK202+UetdxUn7J-nzLgNRJkWXClPDD4q2L55NL0+6m7DnuuZLP8IvJgdZNOkTnMFB8oc4dppOgDEQkUbV3ElYaouO0oliWIC4AspMJDtx8XEQncMqs8bZCdI+sMGXYXBigSlQdcuUVocdsdCkfNei5oVxiXCzqLNPytmi8vKTuzuELpC8mboHqrmA9ZdIbnAwSMeU1cYa3poJZqlha1rYDQptWLtWbHXwALrIIgAB0oAHc8HQmgyuBJPSAoPgANZB4a7LQer0AF3IYEoBAAprHkUkTOGIOQ8EnKPgM2Bsz54uGU36yxXKVFIT8IZUW+GoJQUPW6paVjbarSrgOZqbe4tc4mQBmGEmM3giBhC93frw+x01wUN+JbK7V+OokNdLumywxYeWLvvqeR3Gxwd+-eklaVXfhmSFNSlTfsS9P9jlY8bItvcORAYMYGbrU76hmUSQapW64InBO7lOMqG1A6erMA6TolPaIpFABepcFqnItPhT5oVK+7cFhYpYQ6JEUVEYJZK+P4Pl+dogdxGSMcRjFGr+0rgbULznoyJrDIOfxbm6UGKroYoUiR8S8t+crIUUOHcuR4beuQtZgAAyr6AbdiGBjunwfBAA#/building-planner
    constructor() {
        this.startingPoint = { x: 22, y: 11 }; // Original starting point in the blueprints
        this.roadConnectPoints = {
            pos: [
                { x: 22, y: 5 },
                { x: 30, y: 13 },
                { x: 22, y: 21 },
                { x: 14, y: 13 },
                { x: 15, y: 20 },
                { x: 15, y: 6 },
                { x: 29, y: 6 },
                { x: 29, y: 20 },
            ],
        };
        this.spawn = {
            pos: [{ x: 22, y: 11 }],
        };
        this.road = {
            pos: [
                { x: 22, y: 10 },
                { x: 23, y: 11 },
                { x: 24, y: 12 },
                { x: 25, y: 13 },
                { x: 24, y: 14 },
                { x: 23, y: 15 },
                { x: 22, y: 16 },
                { x: 21, y: 15 },
                { x: 20, y: 14 },
                { x: 19, y: 13 },
                { x: 20, y: 12 },
                { x: 21, y: 11 },
                { x: 21, y: 14 },
                { x: 22, y: 13 },
                { x: 23, y: 14 },
                { x: 18, y: 12 },
                { x: 17, y: 11 },
                { x: 18, y: 10 },
                { x: 19, y: 9 },
                { x: 20, y: 8 },
                { x: 21, y: 9 },
                { x: 23, y: 9 },
                { x: 24, y: 8 },
                { x: 25, y: 9 },
                { x: 26, y: 10 },
                { x: 27, y: 11 },
                { x: 26, y: 12 },
                { x: 26, y: 14 },
                { x: 27, y: 15 },
                { x: 26, y: 16 },
                { x: 25, y: 17 },
                { x: 24, y: 18 },
                { x: 23, y: 17 },
                { x: 21, y: 17 },
                { x: 20, y: 18 },
                { x: 19, y: 17 },
                { x: 18, y: 16 },
                { x: 17, y: 15 },
                { x: 18, y: 14 },
                { x: 28, y: 12 },
                { x: 28, y: 13 },
                { x: 28, y: 14 },
                { x: 23, y: 7 },
                { x: 22, y: 7 },
                { x: 21, y: 7 },
                { x: 16, y: 12 },
                { x: 16, y: 13 },
                { x: 16, y: 14 },
                { x: 21, y: 19 },
                { x: 22, y: 19 },
                { x: 23, y: 19 },
                { x: 29, y: 13 },
                { x: 15, y: 13 },
                { x: 22, y: 6 },
                { x: 30, y: 13 },
                { x: 22, y: 5 },
                { x: 14, y: 13 },
                { x: 22, y: 20 },
                { x: 22, y: 21 },
                { x: 19, y: 7 },
                { x: 18, y: 7 },
                { x: 17, y: 7 },
                { x: 16, y: 8 },
                { x: 16, y: 9 },
                { x: 16, y: 10 },
                { x: 16, y: 16 },
                { x: 16, y: 17 },
                { x: 16, y: 18 },
                { x: 17, y: 19 },
                { x: 18, y: 19 },
                { x: 19, y: 19 },
                { x: 28, y: 10 },
                { x: 28, y: 9 },
                { x: 28, y: 8 },
                { x: 27, y: 7 },
                { x: 26, y: 7 },
                { x: 25, y: 7 },
                { x: 28, y: 16 },
                { x: 28, y: 17 },
                { x: 28, y: 18 },
                { x: 27, y: 19 },
                { x: 26, y: 19 },
                { x: 25, y: 19 },
                { x: 16, y: 7 },
                { x: 15, y: 6 },
                { x: 16, y: 19 },
                { x: 15, y: 20 },
                { x: 28, y: 19 },
                { x: 29, y: 20 },
                { x: 28, y: 7 },
                { x: 29, y: 6 },
            ],
        };
        this.link = {
            pos: [{ x: 21, y: 13 }],
        };
        this.storage = { pos: [{ x: 22, y: 14 }] };
        this.container = { pos: [{ x: 20, y: 13 }] };
        this.tower = {
            pos: [
                { x: 22, y: 12 },
                { x: 23, y: 12 },
                { x: 21, y: 12 },
            ],
        };
        this.lab = {
            pos: [
                { x: 23, y: 16 },
                { x: 24, y: 17 },
                { x: 24, y: 16 },
                { x: 24, y: 15 },
                { x: 25, y: 16 },
                { x: 25, y: 15 },
            ],
        };
        this.extension = {
            pos: [
                { x: 23, y: 10 },
                { x: 24, y: 9 },
                { x: 24, y: 10 },
                { x: 24, y: 11 },
                { x: 25, y: 10 },
                { x: 25, y: 11 },
                { x: 25, y: 12 },
                { x: 26, y: 11 },
                { x: 25, y: 14 },
                { x: 26, y: 15 },
                { x: 21, y: 16 },
                { x: 20, y: 17 },
                { x: 20, y: 16 },
                { x: 19, y: 16 },
                { x: 20, y: 15 },
                { x: 19, y: 15 },
                { x: 18, y: 15 },
                { x: 19, y: 14 },
                { x: 19, y: 12 },
                { x: 18, y: 11 },
                { x: 19, y: 11 },
                { x: 19, y: 10 },
                { x: 20, y: 11 },
                { x: 20, y: 10 },
                { x: 20, y: 9 },
                { x: 21, y: 10 },
                { x: 25, y: 8 },
                { x: 26, y: 8 },
                { x: 27, y: 8 },
                { x: 27, y: 9 },
                { x: 26, y: 9 },
                { x: 27, y: 10 },
                { x: 19, y: 8 },
                { x: 18, y: 9 },
                { x: 17, y: 10 },
                { x: 17, y: 9 },
                { x: 17, y: 8 },
                { x: 18, y: 8 },
                { x: 27, y: 16 },
                { x: 26, y: 17 },
                { x: 25, y: 18 },
                { x: 26, y: 18 },
                { x: 27, y: 18 },
                { x: 27, y: 17 },
                { x: 17, y: 16 },
                { x: 18, y: 17 },
                { x: 19, y: 18 },
                { x: 18, y: 18 },
                { x: 17, y: 18 },
                { x: 17, y: 17 },
                { x: 16, y: 15 },
                { x: 28, y: 15 },
                { x: 16, y: 11 },
                { x: 28, y: 11 },
                { x: 20, y: 7 },
                { x: 24, y: 7 },
                { x: 24, y: 19 },
                { x: 20, y: 19 },
                { x: 26, y: 13 },
                { x: 18, y: 13 },
            ],
        };
        this.powerSpawn = {
            pos: [{ x: 22, y: 17 }],
        };
        this.terminal = {
            pos: [{ x: 22, y: 15 }],
        };
    }
}

export default Bunker;
