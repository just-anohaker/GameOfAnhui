"use strict";

module.exports = {
    start_period: async function (periodId) {
        const indexesKeys = [];
        for (let key of app.sdb.indexes.keys()) {
            indexesKeys.push(key);
        }
        const indexSchemaKeys = [];
        for (let key of app.sdb.indexSchema.keys()) {
            indexSchemaKeys.push(key);
        }
        console.log("app.sdb.indexes:", JSON.stringify(indexesKeys, null, 2));
        console.log("app.sdb.indexSchema:", JSON.stringify(indexSchemaKeys, null, 2));

        app.sdb.lock("game.period@" + periodId);
        const variableExists = await app.model.Variable.exists({ key: "period" });
        if (variableExists) {
            const currentPeriod = await app.model.Variable.findAll({
                fields: ["value"],
                condition: { key: "period" }
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
            tid: this.trs.id,
            periodId,
            status: 0
        });
        app.sdb.create("variable", {
            key: "period",
            value: periodId
        });
        // return "Contract[start_period] not implemented.";
    },

    betting: async function () {
        return "Contract[betting] not implemented.";
    },

    mothball_period: async function (periodId) {
        app.sdb.lock("game.period@" + periodId);
        let found = await app.model.Period.findAll({
            fields: ["tid", "status"],
            condition: { periodId }
        });
        if (found.length != 1) {
            return `period(${periodId}) not exists.`;
        }
        if (found[0].status !== 0) {
            return `period(${periodId}) not in started status.`;
        }

        app.sdb.update("game_period", { status: 1 }, { tid: found[0].tid, periodId });
        // return "Contract[mothball_period] not implemented.";
    },

    end_period: async function (periodId, points) {
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

        app.sdb.update("game_period",
            { status: 2, point_sequences: JSON.stringify(points.map(val => val.toString())) },
            { tid: found[0].tid, periodId });
        // return "Contract[end_period] not implemented.";
    }
}