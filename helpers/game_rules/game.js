"use strict";

const PeriodBegin = "period_begin";
const PeriodMothball = "period_mothball";
const PeriodEnd = "period_end";

class GameRules {
    constructor() {
        this.gameInsts = new Map();

        this.periodInfo = null; // {period, status, height}
    }

    async _init() {
        // init
        do {
            const count = await app.model.Variable.count({ key: { $like: "period-%" } });
            if (count !== 1) break;

            const [period = null] = await app.model.Variable.findAll({
                fields: ["key", "value"],
                condition: {
                    key: { $like: "period-%" }
                }
            });
            if (period == null) break;

            const [periodInfo = null] = await app.model.Period.findAll({
                fields: ["periodId", "begin_tid", "mothball_tid", "end_tid", "status"],
                condition: { periodId: period.value }
            });
            if (periodInfo == null) break;

            let status = null, trId = null;
            if (periodInfo.status === 0 && periodInfo.begin_tid != null) {
                status = PeriodBegin;
                trId = periodInfo.begin_tid;

                // const [trInfo = null] = app.model.Transaction.findAll({
                //     fields: ["height"],
                //     condition: { id: periodInfo.begin_tid }
                // });
                // if (trInfo == null) {
                //     break;
                // }
                // this.periodInfo = { period: period.value, status: PeriodBegin, height: trInfo.height };
            } else if (periodInfo.status === 1 && periodInfo.mothball_tid != null) {
                status = PeriodMothball;
                trId = periodInfo.mothball_tid;
                // const [trInfo = null] = app.model.Transaction.findAll({
                //     fields: ["height"],
                //     condition: { id: periodInfo.mothball_tid }
                // });
                // if (trInfo == null) {
                //     break;
                // }
                // this.periodInfo = { period: period.value, status: PeriodMothball, height: trInfo.height };
            } else if (periodInfo.status === 2 && periodInfo.end_tid != null) {
                status = PeriodEnd;
                trId = periodInfo.end_tid;
                // const [trInfo = null] = app.model.Transaction.findAll({
                //     fields: ["height"],
                //     condition: { id: periodInfo.end_tid }
                // });
                // if (trInfo == null) {
                //     break;
                // }
                // this.periodInfo = { period: period.value, status: PeriodEnd, height: trInfo.height };
            }
            if (status != null && trId != null) {
                const [trInfo = null] = await app.model.Transaction.findAll({
                    fields: ["height"],
                    condition: { id: trId }
                });
                if (trInfo == null) break;

                this.periodInfo = { period: period.value, status, height: trInfo.height };
            }
        } while (false);
        console.log("[GameRule] init:", this.periodInfo);
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