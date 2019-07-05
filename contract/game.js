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
        // let exists = await app.model.Period.exists({ tid: this.trs.id, periodId });
        // if (exists) return `periodId(${periodId}) already started.`;
        app.sdb.create("game_period", {
            tid: this.trs.id,
            periodId,
            status: 0
        });
        // return "Contract[start_period] not implemented.";
    },

    betting: async function () {
        return "Contract[betting] not implemented.";
    },

    mothball_period: async function (periodId) {
        app.sdb.lock("game.period@" + periodId);
        let found = await app.model.GamePeriod.findAll({
            fields: ["tid", "status"],
            condition: { periodId }
        });
        if (found.length != 1) return `periodId(${periodId}) not exists.`;
        if (found[0].status !== 0) return `periodId(${periodId}) not in started status.`;

        app.sdb.update("game_period", { status: 1 }, { tid: found[0].id, periodId });
        // return "Contract[mothball_period] not implemented.";
    },

    end_period: async function (periodId, points) {
        app.sdb.lock("game.period@" + periodId);
        let found = await app.model.GamePeriod.findAll({
            fields: ["tid", "status"],
            condition: { periodId }
        });
        if (found.length !== 1) return `periodId(${periodId}) not exists.`;
        if (found[0].status !== 1) return `periodId(${periodId}) not in mothball_period status.`;

        app.sdb.update("game_period", { status: 2, point_sequences: JSON.stringify(points.map(val => val.toString())) },
            { tid: found[0].id, periodId });
        // return "Contract[end_period] not implemented.";
    }
}