"use strict";

class Rule {
    constructor() {

    }

    appendBetting(periodId, type, args, trs, block) {
        app.sdb.create("game_betting", {
            tid: trs.id,
            periodId,
            address: trs.senderId,
            type,
            args: JSON.stringify(args),
        });
    }

    beginPeriod(periodId, trs, block) {

    }

    mothballPeriod(periodId, trs, block) {

    }

    endPeriod(periodId, points, trs, block) {

    }
}

module.exports = Rule;