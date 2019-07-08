"use strict";

const validate = require("validate.js");
const bignum = require("bignumber");

const config = require("../config");

const PeriodBegin = "period_begin";
const PeriodMothball = "period_mothball";
const PeriodEnd = "period_end";

class GameRules {
    constructor() {
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
            } else if (periodInfo.status === 1 && periodInfo.mothball_tid != null) {
                status = PeriodMothball;
                trId = periodInfo.mothball_tid;
            } else if (periodInfo.status === 2 && periodInfo.end_tid != null) {
                status = PeriodEnd;
                trId = periodInfo.end_tid;
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

    async appendBetting(periodId, betOrders, trs, block) {
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

        const modeList = ["1", "2", "3", "4", "5"];
        const [{ amount = "" }] = await app.model.Reward.findAll({
            fields: ["amount"],
            condition: { periodId }
        });
        let bnum = bignum(amount);
        for (let i = 0; i < betOrders.length; i++) {
            const order = betOrders[i];
            const { mode = null, point = null, amount = null } = betOrders[i];
            if (!validate.isInteger(Number(mode)) || !validate.isInteger(Number(point))) {
                return "order must contains mode, point all in string type with number format.";
            }
            try {
                bignum(amount)
            } catch (error) {
                return "order must contains amount in string type with bignumber format";
            }
            if (!modeList.includes(mode)) {
                return `unsupported mode(${mode}), validable modes(${modeList})`;
            }

            // check balance
            // if (app.balances.get(trs.senderId, config.currency).lt(amount)) {
            //     return "Insufficient balance"
            // }
            app.balances.increase(trs.senderId, config.currency, amount);
            bnum = bnum.plus(amount);
        }

        app.sdb.update("GameReward", { amount: bnum.toString() }, { periodId });
        app.sdb.create("game_betting", {
            tid: trs.id,
            periodId,
            address: trs.senderId,
            orders: JSON.stringify(betOrders)
        });
    }

    async beginPeriod(periodId, trs, block) {
        this.periodInfo = { period: periodId, status: PeriodBegin, height: block.height };
    }

    async mothballPeriod(periodId, trs, block) {
        this.periodInfo = { period: periodId, status: PeriodMothball, height: block.height };
    }

    async endPeriod(periodId, points, trs, block) {
        this.periodInfo = { period: periodId, status: PeriodEnd, height: block.height };
    }
}

module.exports = GameRules;