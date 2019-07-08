"use strict";

class GameRules {
    constructor() {
        this.gameInsts = new Map();

        // init
    }

    registerGameType(type, inst) {
        if (!this.gameInsts.has(type)) {
            this.gameInsts.set(type, inst);
        }
    }

    appendBetting(periodId, type, args) {
        const inst = this.gameInsts.get(type);
        if (!inst) {
            return `unsupported game type(${type})`;
        }

        return inst.appendBetting(periodId, type, args);
    }

    beginPeriod(periodId) {

    }

    mothballPeriod(periodId) {

    }

    endPeriod(periodId, points) {

    }
}

module.exports = GameRules;