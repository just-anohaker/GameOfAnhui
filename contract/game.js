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
        let exists = await app.model.Period.exists({ periodId });
        if (exists) {
            return `period(${periodId}) already exists.`;
        }
        app.sdb.create("game_period", {
            periodId,
            begin_tid: this.trs.id,
            status: 0
        });
        app.sdb.create("variable", {
            key: `period-${periodId}`,
            value: periodId
        });
        return app.gameRules.beginPeriod(periodId, this.trs, this.block);
        // return "Contract[start_period] not implemented.";
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
        let validateMsg = null;
        for (let i = 0; i < betOrders.length; i++) {
            if (!(validateMsg = Validate(betOrders[i], {
                mode: { type: "string", presence: true, inclusion: ["1", "2", "3", "4", "5"] },
                point: { type: "string", presence: true, format: /[0-9]+/ },
                amount: { type: "string", presence: true, format: /[1-9][0-9]*/ }
            }))) {
                return JSON.stringify(validateMsg);
            }
        }

        return app.gameRules.appendBetting(periodId, betOrders, this.trs, this.block);
        // return "Contract[betting] not implemented.";
    },

    mothball_period: async function (periodId) {
        let periodIdChecker;
        if (periodIdChecker = app.validate("string", periodId, { number: { onlyInteger: true } })) {
            return JSON.stringify(periodIdChecker);
        }

        app.sdb.lock("game.period@" + periodId);
        let found = await app.model.Period.findAll({
            fields: ["status"],
            condition: { periodId }
        });
        if (found.length != 1) {
            return `period(${periodId}) not exists.`;
        }
        if (found[0].status !== 0) {
            return `period(${periodId}) not in started status.`;
        }

        app.sdb.update("game_period",
            { status: 1 },
            { periodId }
        );
        app.sdb.update("game_period",
            { mothball_tid: this.trs.id },
            { periodId }
        );
        return app.gameRules.mothballPeriod(periodId, this.trs, this.block);
        // return "Contract[mothball_period] not implemented.";
    },

    end_period: async function (periodId, points) {
        let periodIdChecker, pointsChecker;
        if (periodIdChecker = app.validate("string", periodId, { number: { onlyInteger: true } })) {
            return JSON.stringify(periodIdChecker);
        }
        if (pointsChecker = app.validate("array", points, { length: 3 })) {
            return JSON.stringify(pointsChecker);
        }

        app.sdb.lock("game.period@" + periodId);
        let found = await app.model.Period.findAll({
            fields: ["tid", "status"],
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

        app.sdb.update("game_period",
            { status: 2 },
            { periodId }
        );
        app.sdb.update("game_period",
            { end_tid: this.trs.id },
            { periodId }
        );
        app.sdb.update("game_period",
            { point_sequences: JSON.stringify(points.map(val => val.toString())) },
            { periodId }
        );
        app.sdb.del("variable", { key: currentPeriod[0].key });
        return app.gameRules.endPeriod(periodId, points, this.trs, this.block);
        // return "Contract[end_period] not implemented.";
    }
}