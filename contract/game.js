"use strict";

module.exports = {
    start_period: async function (periodId) {
        let periodIdChecker;
        if (periodIdChecker = app.validate("string", periodId, { number: { onlyInteger: true } })) {
            return JSON.stringify(periodIdChecker);
        }

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

    betting: async function (periodId, type, args) {
        let periodIdChecker, typeChecker;
        if (periodIdChecker = app.validate("string", periodId, { number: { onlyInteger: true } })) {
            return JSON.stringify(periodIdChecker);
        }
        if (!/^[1-9][0-9]*$/.test(type)) {
            typeChecker = "type must be integer";
            return JSON.stringify(typeChecker);
        }

        return app.gameRules.appendBetting(periodId, type, args, this.trs, this.block);
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