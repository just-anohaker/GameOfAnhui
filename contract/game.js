"use strict";

const Validate = require("validate.js");

module.exports = {
    start_period: async function (periodId) {
        let periodIdChecker;
        if (periodIdChecker = app.validate("string", periodId, { number: { onlyInteger: true } })) {
            return JSON.stringify(periodIdChecker);
        }

        app.sdb.lock("game.period@" + periodId);
        const variableCount = await app.model.Variable.count({ key: { $like: "period-%" } });
        if (variableCount > 1) {
            const msg = `variable period record count(${variableCount}), in Exception.`;
            console.log(msg);
            return msg;
        }
        if (variableCount === 1) {
            const currentPeriod = await app.model.Variable.findAll({
                fields: ["key", "value"],
                condition: {
                    key: { $like: "period-%" }
                }
            });
            const msg = `period(${currentPeriod[0].value}) is in processing`;
            console.log(msg);
            return msg;
        }
        let exists = await app.model.GamePeriod.exists({ periodId });
        if (exists) {
            return `period(${periodId}) already exists.`;
        }
        const resp = await app.gameRules.beginPeriod(periodId, this.trs, this.block);
        if (resp) {
            return resp;
        }

        app.sdb.create("GamePeriod", {
            periodId,
            begin_tid: this.trs.id,
            status: 0
        });
        app.sdb.create("GameReward", {
            periodId,
            amount: "0"
        });
        app.sdb.create("Variable", {
            key: `period-${periodId}`,
            value: periodId
        });
        if (!app.sdb.get("Variable", { key: "lastestPeriod" })) {
            app.sdb.create("Variable", { key: "lastestPeriod", value: periodId });
        } else {
            app.sdb.update("Variable", { value: periodId }, { key: "lastestPeriod" });
        }

        // TODO:  notify period started
        app.api.dapps.notification({
            event: "start-period",
            eventData: periodId
        }, () => { });
    },

    /**
     * 
     * @param {*} periodId 
     * @param {*} betOrders - [{mode, point, amount}]
     */
    betting: async function (periodId, betOrders) {
        let periodIdChecker;
        if (periodIdChecker = app.validate("string", periodId, { number: { onlyInteger: true } })) {
            return JSON.stringify(periodIdChecker);
        }
        if (!Validate.isArray(betOrders)) {
            return JSON.stringify("betOrders must be array.");
        }

        return await app.gameRules.appendBetting(periodId, betOrders, this.trs, this.block);
        // return "Contract[betting] not implemented.";
    },

    unbetting: async function (trId) {
        // TODO
    },

    mothball_period: async function (periodId) {
        let periodIdChecker;
        if (periodIdChecker = app.validate("string", periodId, { number: { onlyInteger: true } })) {
            return JSON.stringify(periodIdChecker);
        }
        app.sdb.lock("game.period@" + periodId);
        let found = await app.model.GamePeriod.findAll({
            fields: ["status"],
            condition: { periodId }
        });
        if (found.length != 1) {
            return `period(${periodId}) not exists.`;
        }
        if (found[0].status !== 0) {
            return `period(${periodId}) not in started status.`;
        }
        const resp = await app.gameRules.mothballPeriod(periodId, this.trs, this.block);
        if (resp) {
            return resp;
        }

        app.sdb.update("GamePeriod",
            { status: 1 },
            { periodId }
        );
        app.sdb.update("GamePeriod",
            { mothball_tid: this.trs.id },
            { periodId }
        );
        // TODO: notify period mothball
        app.api.dapps.notification({
            event: "mothball-period",
            eventData: periodId
        }, () => { });
    },

    end_period: async function (periodId, points, hash) {
        let periodIdChecker, pointsChecker, hashChecker = "hash must be string";
        if (periodIdChecker = app.validate("string", periodId, { number: { onlyInteger: true } })) {
            return JSON.stringify(periodIdChecker);
        }
        if (pointsChecker = app.validate("array", points, { length: 3 })) {
            return JSON.stringify(pointsChecker);
        }
        if (!(typeof hash === "string" && hash.trim() !== "")) {
            return JSON.stringify(hashChecker);
        }
        hash = hash.trim();
        for (let p of points) {
            if (typeof p !== "string") {
                return JSON.stringify("points item must be string");
            }
        }

        app.sdb.lock("game.period@" + periodId);
        let found = await app.model.GamePeriod.findAll({
            fields: ["status"],
            condition: { periodId }
        });
        if (found.length !== 1) {
            return `period(${periodId}) not exists.`;
        }
        if (found[0].status !== 1) {
            return `period(${periodId}) not in mothball_period status.`;
        }

        const currentPeriod = await app.model.Variable.findAll({
            fields: ["key", "value"],
            condition: {
                key: { $like: "period-%" }
            }
        });
        if (currentPeriod.length !== 1) {
            return "Exception: variable record period more than one";
        }
        const resp = await app.gameRules.endPeriod(periodId, points, this.trs, this.block);
        if (resp) {
            return resp;
        }

        app.sdb.update("GamePeriod", { status: 2 }, { periodId });
        app.sdb.update("GamePeriod", { end_tid: this.trs.id }, { periodId });
        app.sdb.update("GamePeriod",
            { point_sequences: JSON.stringify(points.map(val => val.toString())) },
            { periodId }
        );
        app.sdb.update("GamePeriod", { hash }, { periodId });
        app.sdb.del("Variable", { key: currentPeriod[0].key });
        // TODO: notify period end
        app.api.dapps.notification({
            event: "end-period",
            eventData: { periodId, points, hash }
        }, () => { });
    }
}