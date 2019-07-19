"use strict";

const { getStartSlot, parseOffsetAndLimit } = require("../helpers/utils");

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
    const body = req.query;
    const condDateTime = String(body.datetime || "");

    const condition = { status: 2 };
    if (typeof condDateTime === "string" && condDateTime !== "") {
        condition.periodId = { $like: condDateTime + "%" };
    }
    let [offset, limit] = parseOffsetAndLimit(body.offset || "0", body.limit || "40", 0, 40);
    // if (offset >= limit) offset = 0;
    const periods = await app.model.GamePeriod.findAll({
        fields: ["periodId", "point_sequences", "hash"],
        condition,
        sort: { periodId: -1 },
        // offset,
        // limit
    });
    const result = periods.map(val => {
        const points = JSON.parse(val.point_sequences);
        val.point_sequences = points.map(val => Number(val));
        val.timestamp = getStartSlot(val.periodId);
        return val;
    });

    return {
        result: result.slice(offset, offset + limit),
        count: result.length
    };
});

app.route.get("/game/period_detail", async function (req) {
    const body = req.query;
    const periodId = String(body.periodId || "");
    if (periodId === "") {
        throw new Error("periodId is unavailable");
    }

    const result = [];
    const period = await app.model.GamePeriod.findOne({
        fields: ["periodId", "begin_tid", "mothball_tid", "end_tid", "status", "point_sequences", "hash"],
        condition: { periodId, status: 2 }
    });
    if (period) {
        period.point_sequences = JSON.parse(period.point_sequences);
        result.push(period);
    }
    return { result };
});