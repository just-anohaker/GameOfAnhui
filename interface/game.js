"use strict";

app.route.get("/game/period", async function (req) {
    if (!await app.model.Variable.exists({ key: "lastestPeriod" })) {
        return undefined;
    }
    const lasteastPeriod = await app.model.Variable.findOne({ fields: ["value"], condition: { key: "lastestPeriod" } });
    const periodId = lasteastPeriod.value;
    const periodInfo = await app.model.GamePeriod.findOne({
        fields: ["begin_tid", "mothball_tid", "end_tid", "status"],
        condition: { periodId }
    });
    if (periodInfo == null) {
        throw new Error(`PeriodId(${periodId}) not found`);
    }
    return {
        result: {
            id: periodId,
            status: periodInfo.status,
            startTr: periodInfo.begin_tid,
            mothballTr: periodInfo.mothball_tid,
            endTr: periodInfo.end_tid
        }
    };
});

app.route.get("/game/periods", async function (req) {
    const periods = await app.model.GamePeriod.findAll({
        fields: ["periodId", "point_sequences", "hash"],
        condition: { status: 2 },
        sort: { periodId: -1 }
    });
    const result = periods.map(val => {
        // TODO
        const points = JSON.parse(val.point_sequences);
        val.point_sequences = points.map(val => Number(val));
        return val;
    });

    return {
        result,
        count: result.length
    };

});

app.route.get("/game/information", async function (req) {
    // TODO
    throw new Error("[Interface game] /game/information unimplemented.");
});

app.route.get("/game/rules", async function (req) {
    // TODO
    throw new Error("[Interface game] /game/rules unimplemented.");
});