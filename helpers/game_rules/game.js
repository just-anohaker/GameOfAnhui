"use strict";

const validate = require("validate.js");
const bignum = require("bignumber");

const config = require("../config");
const gamecfg = require("./game_config");
const Mode1 = require("./rules/game_rule1");
const Mode2 = require("./rules/game_rule2");
const Mode3 = require("./rules/game_rule3");
const Mode4 = require("./rules/game_rule4");
const Mode5 = require("./rules/game_rule5");

const PeriodBegin = "period_begin";
const PeriodMothball = "period_mothball";
const PeriodEnd = "period_end";

class GameRules {
    constructor() {
        this.periodInfo = null; // {period, status, height}

        this.gameRuleInsts = new Map();
        this.gameRuleInsts.set("1", new Mode1());
        this.gameRuleInsts.set("2", new Mode2());
        this.gameRuleInsts.set("3", new Mode3());
        this.gameRuleInsts.set("4", new Mode4());
        this.gameRuleInsts.set("5", new Mode5());
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

            const [periodInfo = null] = await app.model.GamePeriod.findAll({
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

        const { amount = "0" } = app.sdb.get("GameReward", { periodId });
        let bnum = bignum(amount);
        let bamount = bignum("0");
        for (let i = 0; i < betOrders.length; i++) {
            const { mode = null, point = null, amount = null } = betOrders[i];
            try {
                if (typeof mode !== "string") {
                    throw new Error("mode must be a string");
                }
                if (!this.gameRuleInsts.has(mode)) {
                    throw new Error("mode value must in ['1', '2', '3', '4', '5']");
                }
                const inst = this.gameRuleInsts.get(mode);
                inst.validate(point, amount);

                // check balance
                if (app.balances.get(trs.senderId, config.currency).sub(bamount).lt(amount)) {
                    return "Insufficient balance"
                }
                // app.balances.decrease(trs.senderId, config.currency, amount);
                bamount = bamount.plus(amount);
                bnum = bnum.plus(amount);
            } catch (error) {
                return error.toString();
            }
        }

        app.balances.decrease(trs.senderId, config.currency, bamount.toString());
        app.sdb.update("GameReward", { amount: bnum.toString() }, { periodId });
        app.sdb.create("GameBetting", {
            tid: trs.id,
            timestamp: trs.timestamp,
            periodId,
            address: trs.senderId,
            orders: JSON.stringify(betOrders)
        });
    }

    async beginPeriod(periodId, trs, block) {
        if (gamecfg.BankerPublicKey != trs.senderPublicKey) {
            return "Permission denied";
        }
        this.periodInfo = { period: periodId, status: PeriodBegin, height: block.height };
    }

    async mothballPeriod(periodId, trs, block) {
        if (gamecfg.BankerPublicKey != trs.senderPublicKey) {
            return "Permission denied";
        }
        this.periodInfo = { period: periodId, status: PeriodMothball, height: block.height };
    }

    async endPeriod(periodId, points, trs, block) {
        if (gamecfg.BankerPublicKey != trs.senderPublicKey) {
            return "Permission denied";
        }
        const self = this;
        this.periodInfo = { period: periodId, status: PeriodEnd, height: block.height };

        const rewards = await app.model.GameReward.findAll({
            fields: ["periodId", "amount"],
            condition: { periodId }
        });
        if (rewards.length === 1) {
            app.balances.increase(gamecfg.BankerAddress, config.currency, rewards[0].amount);
        }
        const allTrs = await app.model.GameBetting.findAll({
            fields: ["tid", "address", "orders"],
            condition: { periodId }
        });
        allTrs.forEach(tr => {
            let total = bignum("0");
            const orders = JSON.parse(tr.orders);
            orders.forEach(order => {
                if (self.gameRuleInsts.has(order.mode)) {
                    total = total.plus(self.gameRuleInsts.get(order.mode).settle(periodId, order.point, order.amount, points));
                } else {
                    total = total.plus(order.amount);
                }
            });
            app.sdb.create("GameSettlement", {
                tid: tr.tid,
                result: total.lt("0") ? 0 : 1,
                amount: total.toString()
            });
            // app.balances.transfer(config.currency, total.toString(), "", tr.address);
            app.balances.increase(tr.address, config.currency, total.toString());
        });
    }
}

module.exports = GameRules;