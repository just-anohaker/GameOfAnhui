"use strict";

app.route.get("/game/period", async function (req) {
    const variableCount = await app.model.Variable.count({ key: { $like: "period-%" } });
    if (variableCount === 0) {
        return undefined;
    }
    if (variableCount !== 1) {
        throw new Error(`period exception with ${variableCount}`);
    }
    const currentPeriod = await app.model.Variable.findOne({
        fields: ["key", "value"],
        condition: { key: { $like: "period-%" } }
    });
    if (currentPeriod == null) {
        throw new Error("Not in period");
    }
    const periodId = currentPeriod.value;
    const periodInfo = await app.model.GamePeriod.findOne({
        fields: ["begin_tid", "mothball_tid", "end_tid", "status"],
        condition: { periodId }
    });
    if (periodInfo == null) {
        throw new Error(`PeriodId(${periodId}) not found`);
    }
    return {
        id: periodId,
        status: periodInfo.status,
        startTr: periodInfo.begin_tid,
        mothballTr: periodInfo.mothball_tid,
        endTr: periodInfo.end_tid
    };
});

app.route.get("/game/periods", async function (req) {
    // TODO
    throw new Error("[Interface game] /game/periods unimplemented.");
});

app.route.get("/game/information", async function (req) {
    // TODO
    throw new Error("[Interface game] /game/information unimplemented.");
});

app.route.get("/game/rules", async function (req) {
    // TODO
    throw new Error("[Interface game] /game/rules unimplemented.");
});