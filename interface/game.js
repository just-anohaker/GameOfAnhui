"use strict";

const START_HOUR = 8;
const START_MINUTE = 40;

const PERIOD_PER_DURATION_M = 4;
const PERIOD_PER_DURATION_S = PERIOD_PER_DURATION_M * 60;
const PERIOD_PER_DURATION_MS = PERIOD_PER_DURATION_S * 1000;

function splitPeriodId(periodId) {
    periodId = periodId ? periodId.trim() : "";
    const result = /^(\d{4})(\d{2})(\d{2})(\d{3})$/g.exec(periodId);
    if (result == null) {
        return null;
    }
    const [_, year, month, day, times] = result;
    return { year, month, day, times };
}

function getStartSlot(periodId) {
    const splitResult = splitPeriodId(periodId);
    if (splitResult == null) return null;

    let year = Number(splitResult.year);
    let month = Number(splitResult.month);
    let date = Number(splitResult.day);
    let times = Number(splitResult.times);
    if (!Number.isSafeInteger(year) ||
        !Number.isSafeInteger(month) ||
        !Number.isSafeInteger(date) ||
        !Number.isSafeInteger(times)) {
        return null;
    }

    const startTime = new Date(year, month - 1, date, START_HOUR, START_MINUTE);
    const resultTime = startTime.getTime() + times * PERIOD_PER_DURATION_MS;
    return resultTime;
}

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
            startTime: getStartSlot(periodId),
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
        val.startTime = getStartSlot(val.periodId);
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