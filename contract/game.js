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
        let exists = await app.model.Period.exists({ id: this.trs.id, periodId });
        if (exists) return `periodId(${periodId}) already started.`;
        app.sdb.create("GamePeriod", {
            id: this.trs.id,
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
            fields: ["id", "status"],
            condition: { periodId }
        });
        if (found.length != 1) return `periodId(${periodId}) not exists.`;
        if (found[0].status !== 0) return `periodId(${periodId}) not in started status.`;

        app.sdb.update("GamePeriod", { status: 1 }, { id: found[0].id, periodId });
        // return "Contract[mothball_period] not implemented.";
    },

    end_period: async function (periodId, points) {
        app.sdb.lock("game.period@" + periodId);
        let found = await app.model.GamePeriod.findAll({
            fields: ["id", "status"],
            condition: { periodId }
        });
        if (found.length !== 1) return `periodId(${periodId}) not exists.`;
        if (found[0].status !== 1) return `periodId(${periodId}) not in mothball_period status.`;

        app.sdb.update("GamePeriod", { status: 2, point_sequences: JSON.stringify(points.map(val => val.toString())) },
            { id: found[0].id, periodId });
        // return "Contract[end_period] not implemented.";
    }
}