"use strict";

const bignum = require("bignumber");

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
    const condDateTime = String(body.datetime || "").trim();

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
    const periodId = String(body.periodId || "").trim();
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

app.route.get("/game/period_bets", async function (req) {
    const body = req.query;
    const periodId = String(body.periodId || "").trim();
    const addressArg = body.address;
    if (periodId === "") {
        throw new Error("period is unavailable");
    }

    let address = null;
    if (addressArg) {
        const s = String(addressArg || "").trim();
        if (s === "") {
            throw new Error("address must be an available address");
        }
        address = s;
    }

    let [offset, limit] = parseOffsetAndLimit(body.offset || "0", body.limit || "100");

    const result = { periodId };
    const period = await app.model.GamePeriod.findOne({
        fields: ["point_sequences"],
        condition: { periodId, status: 2 }
    });
    if (period) {
        result.points = JSON.parse(period.point_sequences);

        const bettingCond = { periodId };
        if (address) {
            bettingCond.address = address;
        }
        const bettings = await app.model.GameBetting.findAll({
            fields: ["tid", "address", "orders"],
            condition: bettingCond
        });
        const tids = bettings.map(val => val.tid);
        const settlements = await app.model.GameSettlement.findAll({
            fields: ["tid", "amount"],
            condition: { tid: { $in: tids } }
        });
        const settlementsMap = new Map();
        settlements.forEach(val => settlementsMap.set(val.tid, val));

        const bets = [];
        bettings.forEach(val => {
            const r = { tid: val.tid, address: val.address, orders: JSON.parse(val.orders) };
            let betAmount = bignum("0");
            r.orders.forEach(val => {
                betAmount = betAmount.plus(val.amount);
            });
            r.bet_amount = betAmount.toString();

            const settlement = settlementsMap.get(val.tid);
            if (settlement) {
                let settle = bignum(settlement.amount);
                settle = settle.sub(r.bet_amount);
                r.settle_amount = settle.toString();
            }
            bets.push(r);
        });
        result.bets = bets.slice(offset, offset + limit);
        result.count = bets.length;
    }

    return { result };
});