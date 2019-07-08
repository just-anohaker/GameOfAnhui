"use strict";

const PeriodBegin = "period_begin";
const PeriodMothball = "period_mothball";
const PeriodEnd = "period_end";

class GameRules {
    constructor() {
        this.gameInsts = new Map();

        this.periodInfo = null; // {period, status, height}

        // init
    }

    registerGameType(type, inst) {
        if (!this.gameInsts.has(type)) {
            this.gameInsts.set(type, inst);
        }
    }

    appendBetting(periodId, type, args, trs, block) {
        const inst = this.gameInsts.get(type);
        if (!inst) {
            return `unsupported game type(${type})`;
        }

        if (this.periodInfo == null) {
            return `not in period now.`;
        }
        if (this.periodInfo.period !== periodId) {
            return `current period(${this.periodInfo.period}), not ${periodId}`;
        }
        if (this.periodInfo.status === PeriodBegin) {
            if (block.height === this.periodInfo.height) {
                return `period(${this.periodInfo.period}) isn't started.`;
            }
        } else if (this.periodInfo.status === PeriodMothball) {
            if (block.height !== this.periodInfo.height) {
                return `period(${this.periodInfo.period}) bettingTime is overed.`;
            }
        } else {
            return `period(${this.periodInfo.period}) is finished.`;
        }

        return inst.appendBetting(periodId, type, args, trs, block);
    }

    beginPeriod(periodId, trs, block) {
        this.periodInfo = { period: periodId, status: PeriodBegin, height: block.height };
        this.gameInsts.forEach(inst => {
            inst.beginPeriod(periodId, trs, block);
        });
    }

    mothballPeriod(periodId, trs, block) {
        this.periodInfo = { period: periodId, status: PeriodMothball, height: block.height };
        this.gameInsts.forEach(inst => {
            inst.mothballPeriod(periodId, trs, block);
        });
    }

    endPeriod(periodId, points, trs, block) {
        this.periodInfo = { period: periodId, status: PeriodEnd, height: block.height };
        this.gameInsts.forEach(inst => {
            inst.endPeriod(periodId, points, trs, block);
        });
    }
}

module.exports = GameRules;